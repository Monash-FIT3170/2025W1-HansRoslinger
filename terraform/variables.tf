variable "project_id" {
  description = "The GCP project ID"
  type        = string
}

variable "region" {
  description = "The GCP region"
  type        = string
  default     = "australia-southeast1"
}

variable "repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
  default     = "my-artifact-repo"
}

variable "bucket_name" {
  description = "The name of the GCS bucket"
  type        = string
}

variable "bucket_location" {
  description = "The location for the GCS bucket (defaults to region if not set)"
  type        = string
  default     = null
}
