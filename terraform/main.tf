terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 4.0.0"
    }
  }
}

resource "google_artifact_registry_repository" "repo" {
  project        = var.project_id
  location       = var.region
  repository_id  = var.repository_name
  format         = "DOCKER"
  description    = "Docker repository for application images"
}
