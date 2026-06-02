
1. EN CASO DE BLOQUEO DE DEPLOY EN VERCEL:

Antes de cada deploy verificar:

Que project.json existe y tiene projectId: prj_dRbwSErdxBzmDn3A6P7xWWz4bQNM
Que npx vercel whoami dice mariolangge-1740 — si no, hacer vercel logout + vercel login abriendo la URL en Brave
Recién ahí: npx vercel --prod --yes
Solución permanente para no tener que hacer esto cada vez: En Vercel → Account Settings → Integrations → GitHub → conectar la cuenta MLN-1994. Así el GitHub integration funcionaría solo con cada push, sin CLI.