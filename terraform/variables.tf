variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "aus_region" {
  description = "The GCP region"
  type        = string
  default     = "australia-southeast1"
}

variable "us_region" {
  description = "The GCP region"
  type        = string
  default     = "us-central1"
}

variable "repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
  default     = "my-artifact-repo"
}
