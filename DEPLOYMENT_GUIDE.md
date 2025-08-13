# 🚀 Deployment Guide - Bảo mật API Keys

## 📋 Pre-Deployment Checklist

### 1. Security Check
```bash
# Chạy security check trước khi deploy
npm run security-check

# Nếu có vấn đề, fix theo hướng dẫn trong SECURITY_FIX.md
```

### 2. Environment Variables Setup

#### Local Development:
```bash
# Tạo file .env.local (không commit vào git)
cp .env.example .env.local
# Chỉnh sửa .env.local với API keys thật
```

#### Production (Vercel):
1. Vào [Vercel Dashboard](https://vercel.com/dashboard)
2. Chọn project của bạn
3. Vào Settings > Environment Variables
4. Thêm các biến:

| Variable Name | Value | Environment |
|---------------|-------|-------------|
| `OPENAI_API_KEY` | `sk-your_openai_key` | Production |
| `STABILITY_API_KEY` | `sk-your_stability_key` | Production |
| `REPLICATE_API_KEY` | `r8_your_replicate_key` | Production |
| `JWT_SECRET` | `your_super_secret_key` | Production |
| `NEXT_PUBLIC_BASE_URL` | `https://yourdomain.com` | Production |

### 3. Build & Test
```bash
# Build project
npm run build

# Test locally
npm run start
```

## 🚀 Deployment Steps

### Vercel (Khuyến nghị)
```bash
# Deploy với security check
npm run pre-deploy

# Hoặc deploy trực tiếp
npm run deploy
```

### Manual Deployment
```bash
# 1. Build
npm run build

# 2. Deploy
vercel --prod

# 3. Auto-update demo
npm run auto-update
```

## 🔐 Security Best Practices

### ✅ DO (Nên làm):
- [ ] Sử dụng environment variables cho tất cả API keys
- [ ] Chạy security check trước mỗi lần deploy
- [ ] Rotate API keys định kỳ (90 ngày)
- [ ] Monitor API usage
- [ ] Setup alerts cho suspicious activity
- [ ] Sử dụng HTTPS cho tất cả connections
- [ ] Validate tất cả user input

### ❌ DON'T (Không nên làm):
- [ ] Hardcode API keys trong code
- [ ] Commit .env files vào git
- [ ] Log API keys
- [ ] Share keys qua email/chat
- [ ] Deploy mà không chạy security check
- [ ] Sử dụng keys trong client-side code

## 🔍 Post-Deployment Verification

### 1. Kiểm tra Environment Variables
```bash
# Kiểm tra xem environment variables có được load đúng không
curl https://yourdomain.com/api/ai/generate
# Response không nên chứa API keys
```

### 2. Test API Endpoints
```bash
# Test AI generation (demo mode)
curl -X POST https://yourdomain.com/api/ai/generate \
  -H "Content-Type: application/json" \
  -d '{"imageBlob":"data:image/jpeg;base64,...","prompt":"test","strength":0.5}'
```

### 3. Check Security Headers
```bash
# Kiểm tra security headers
curl -I https://yourdomain.com
```

## 🚨 Emergency Procedures

### Nếu API key bị lộ:
1. **IMMEDIATELY** revoke key trong provider dashboard
2. Generate new key
3. Update environment variables trong Vercel
4. Deploy immediately
5. Audit logs for suspicious activity

### Nếu deployment fail:
1. Check build logs
2. Verify environment variables
3. Run security check
4. Fix issues
5. Re-deploy

## 📊 Monitoring

### Setup Alerts:
- API usage spikes
- Failed authentication attempts
- Error rate increases
- Response time degradation

### Regular Checks:
- Weekly security check: `npm run security-check`
- Monthly API key rotation
- Quarterly security audit

## 🛠️ Troubleshooting

### Common Issues:

#### "No AI service configured"
- Check environment variables trong Vercel
- Verify API keys are valid
- Restart deployment

#### Build fails
- Check for TypeScript errors
- Verify all dependencies installed
- Check environment variables

#### Security check fails
- Follow SECURITY_FIX.md
- Remove .env files from git history
- Update .gitignore

## 📞 Support

- **Security Issues**: security@yourcompany.com
- **Deployment Issues**: devops@yourcompany.com
- **Emergency**: +1-XXX-XXX-XXXX

## 🔗 Useful Links

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)
- [Security Best Practices](https://owasp.org/www-project-top-ten/)
- [API Key Management](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
