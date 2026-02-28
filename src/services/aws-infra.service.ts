"use server";

import {
  ECSClient,
  UpdateServiceCommand,
  DescribeServicesCommand,
} from "@aws-sdk/client-ecs";
import {
  RDSClient,
  StartDBInstanceCommand,
  StopDBInstanceCommand,
  DescribeDBInstancesCommand,
} from "@aws-sdk/client-rds";

const REGION = "ap-south-1";
const CLUSTER = "rwa-erp-prod";
const SERVICE = "rwa-erp-prod-service";
const DB_INSTANCE = "rwa-erp-prod-pg";

const ecsClient = new ECSClient({ region: REGION });
const rdsClient = new RDSClient({ region: REGION });

export type InfraStatus = {
  ecs: {
    running: number;
    desired: number;
    status: string;
  };
  rds: {
    status: string; // available | stopped | starting | stopping
  };
  overall: "running" | "stopped" | "starting" | "stopping" | "partial";
};

export async function getInfraStatus(): Promise<InfraStatus> {
  const [ecsRes, rdsRes] = await Promise.all([
    ecsClient.send(
      new DescribeServicesCommand({ cluster: CLUSTER, services: [SERVICE] })
    ),
    rdsClient.send(
      new DescribeDBInstancesCommand({
        DBInstanceIdentifier: DB_INSTANCE,
      })
    ),
  ]);

  const svc = ecsRes.services?.[0];
  const db = rdsRes.DBInstances?.[0];

  const ecsRunning = svc?.runningCount ?? 0;
  const ecsDesired = svc?.desiredCount ?? 0;
  const ecsStatus = svc?.status ?? "UNKNOWN";
  const rdsStatus = db?.DBInstanceStatus ?? "unknown";

  let overall: InfraStatus["overall"] = "partial";
  if (ecsRunning >= 1 && rdsStatus === "available") overall = "running";
  else if (ecsDesired === 0 && rdsStatus === "stopped") overall = "stopped";
  else if (rdsStatus === "starting" || rdsStatus === "configuring-enhanced-monitoring")
    overall = "starting";
  else if (rdsStatus === "stopping") overall = "stopping";

  return {
    ecs: { running: ecsRunning, desired: ecsDesired, status: ecsStatus },
    rds: { status: rdsStatus },
    overall,
  };
}

export async function startInfra(): Promise<{ success: boolean; message: string }> {
  try {
    const db = (
      await rdsClient.send(
        new DescribeDBInstancesCommand({ DBInstanceIdentifier: DB_INSTANCE })
      )
    ).DBInstances?.[0];

    const rdsStatus = db?.DBInstanceStatus ?? "unknown";

    // Start RDS if stopped
    if (rdsStatus === "stopped") {
      await rdsClient.send(
        new StartDBInstanceCommand({ DBInstanceIdentifier: DB_INSTANCE })
      );
    }

    // Start ECS service
    await ecsClient.send(
      new UpdateServiceCommand({
        cluster: CLUSTER,
        service: SERVICE,
        desiredCount: 1,
      })
    );

    return {
      success: true,
      message:
        rdsStatus === "stopped"
          ? "Starting RDS and ECS service. RDS takes 2–3 minutes to become available."
          : "ECS service started. RDS was already running.",
    };
  } catch (err: any) {
    return { success: false, message: err.message ?? "Failed to start infra" };
  }
}

export async function stopInfra(): Promise<{ success: boolean; message: string }> {
  try {
    // Scale ECS to 0 first
    await ecsClient.send(
      new UpdateServiceCommand({
        cluster: CLUSTER,
        service: SERVICE,
        desiredCount: 0,
      })
    );

    // Stop RDS
    await rdsClient.send(
      new StopDBInstanceCommand({ DBInstanceIdentifier: DB_INSTANCE })
    );

    return {
      success: true,
      message: "ECS service scaled to 0 and RDS stopping. Infra will be fully stopped in ~2 minutes.",
    };
  } catch (err: any) {
    return { success: false, message: err.message ?? "Failed to stop infra" };
  }
}
