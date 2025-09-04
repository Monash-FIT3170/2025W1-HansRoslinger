# Deploy to NP (local testing)

```
cd terraform
terraform workspace select np
terraform plan -var-file="tfvars/np.tfvars"
terraform apply -var-file="tfvars/np.tfvars"
```

Make sure to verify the plan matches what you expect

# Deploy to PROD (For use by CloudRun)

```
cd terraform
terraform workspace select prod
terraform plan -var-file="tfvars/prod.tfvars"
terraform apply -var-file="tfvars/prod.tfvars"
```
