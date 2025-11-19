# Local Monitoring Setup (Laptop)

This guide shows how to run Prometheus and Grafana on your laptop to monitor the EC2 instance.

## Quick Start

### 1. Update Prometheus Config

```bash
cd monitoring

# Edit prometheus.local.yml and replace YOUR_EC2_IP with your EC2 public IP
# Or use environment variable:
export EC2_IP=your-ec2-public-ip
sed -i.bak "s/YOUR_EC2_IP/${EC2_IP}/g" prometheus/prometheus.local.yml
```

### 2. Start Monitoring

```bash
docker-compose -f docker-compose.local.yml up -d
```

### 3. Access Dashboards

- **Grafana**: http://localhost:3001 (admin/admin)
- **Prometheus**: http://localhost:9090

### 4. Verify Connection

```bash
# Check if Prometheus can reach EC2
open http://localhost:9090/targets

# Should show "forecap-api" as UP
# If DOWN, check:
# 1. EC2 security group allows port 3000 from your IP
# 2. API is running: curl http://EC2_IP:3000/health
# 3. Metrics endpoint: curl http://EC2_IP:3000/metrics
```

## Security Group Configuration

Make sure your EC2 security group allows:
- **Port 3000** (API): From your laptop's public IP
- **Port 9090** (Prometheus): Not needed (Prometheus pulls from EC2)

To find your public IP:
```bash
curl ifconfig.me
```

Then add this IP to EC2 security group inbound rules:
- Type: Custom TCP
- Port: 3000
- Source: Your IP/32

## Troubleshooting

### Prometheus Can't Scrape EC2

1. **Check EC2 Security Group**
   ```bash
   # Test from your laptop
   curl http://EC2_IP:3000/health
   curl http://EC2_IP:3000/metrics
   ```

2. **Check Prometheus Config**
   ```bash
   # Verify IP is correct
   cat prometheus/prometheus.local.yml | grep targets
   ```

3. **Check Prometheus Logs**
   ```bash
   docker-compose -f docker-compose.local.yml logs prometheus
   ```

### Grafana Shows No Data

1. **Check Data Source**
   - Grafana > Configuration > Data Sources
   - Verify Prometheus URL: http://prometheus:9090

2. **Check Time Range**
   - Make sure time range includes when metrics were collected
   - Try "Last 15 minutes" or "Last 1 hour"

3. **Check Query**
   - Open dashboard
   - Click on panel > Edit
   - Check if query returns data in Prometheus

## Stopping Monitoring

```bash
docker-compose -f docker-compose.local.yml down

# To remove volumes (lose all data)
docker-compose -f docker-compose.local.yml down -v
```

## Next Steps

- Run load tests: See [Realistic Load Testing Guide](../docs/realistic-load-testing.md)
- View metrics: Open Grafana dashboard
- Analyze results: Export dashboard as PDF/PNG

