terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
    google-beta = {
      source  = "hashicorp/google-beta"
      version = ">= 4.0.0"
    }
  }
}

module "registry_and_bucket" {
  source = "./modules/infra"
  providers = {
    google = google-beta
  }
  project_id       = var.project_id
  region           = var.region
  repository_name  = var.repository_name
  bucket_name      = var.bucket_name
  bucket_location  = var.bucket_location != null ? var.bucket_location : var.region
}
