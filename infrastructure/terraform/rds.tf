# RDS Subnet Group
resource "aws_db_subnet_group" "main" {
  name       = "${local.name_prefix}-db-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]
  tags       = { Name = "${local.name_prefix}-db-subnet" }
}

# RDS PostgreSQL Instance (Free Tier eligible)
resource "aws_db_instance" "main" {
  identifier = "${local.name_prefix}-pg"

  engine         = "postgres"
  engine_version = "16.6"
  instance_class = "db.t3.micro" # Free tier

  allocated_storage     = 20
  max_allocated_storage = 50
  storage_type          = "gp3"
  storage_encrypted     = true

  db_name  = "rwa_erp"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az            = false # Single AZ for cost savings
  publicly_accessible = false

  backup_retention_period = 7
  backup_window           = "03:00-04:00"
  maintenance_window      = "sun:04:00-sun:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${local.name_prefix}-final-snapshot"

  performance_insights_enabled = false # Not available on t3.micro free tier

  tags = { Name = "${local.name_prefix}-pg" }
}
