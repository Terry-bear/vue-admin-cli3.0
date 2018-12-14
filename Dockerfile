FROM nginx:alpine
COPY .  /front-end
RUN sed -i  '/^worker_processes/ s:.*:worker_processes  auto;:' /etc/nginx/nginx.conf \
    && rm -rf /etc/nginx/conf.d/default.conf \
    && echo -e '\n'\
    'server {\n'\
    '    listen       80 default backlog=2048;\n'\
    '    listen       443 ssl;\n'\
    '    server_name  _;\n'\
    '\n'\
    '    ssl_certificate /etc/nginx/ssl/www.pem;\n'\
    '    ssl_certificate_key /etc/nginx/ssl/www.key;\n'\
    '    ssl_protocols TLSv1 TLSv1.1 TLSv1.2;\n'\
    '    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5:!RC4:!DHE;\n'\
    '    ssl_prefer_server_ciphers on;\n'\
    '\n'\
    '\n'\
    '    location ^~ /api/ {\n'\
    '        resolver 127.0.0.11 ipv6=off;\n'\
    '        rewrite /api/(\w+)/(.*) /$2 break;\n'\
    '        proxy_pass http://$1:8080;\n'\
    '        proxy_set_header   Host    $host;\n'\
    '        proxy_set_header   X-Real-IP   $remote_addr;\n'\
    '        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;\n'\
    '        proxy_set_header Upgrade $http_upgrade;\n'\
    '        proxy_set_header Connection "upgrade";\n'\
    '    }\n'\
    '\n'\
    '    set $subdomain menu;\n'\
    '    if ( $host ~* ^(\\b(?!www\\b).+)\.\w+\.\w+/?.*$) {\n'\
    '        set $subdomain $1;\n'\
    '    }\n'\
    '\n'\
    '    location / {\n'\
    '        root    /usr/share/nginx/www/$subdomain/;\n'\
    '        try_files $uri $uri/ /index.html;\n'\
    '        index  index.html index.htm;\n'\
    '        proxy_set_header   Host    $host;\n'\
    '        proxy_set_header   X-Real-IP   $remote_addr;\n'\
    '        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;\n'\
    '        proxy_set_header Upgrade $http_upgrade;\n'\
    '        proxy_set_header Connection "upgrade";\n'\
    '    }\n'\
    '}\n'\
    '\n'\
    >/etc/nginx/conf.d/default.conf \
    && apk --update add --no-cache nodejs npm \
    && cd /front-end && npm install \
    && apk add git \
    && npm run gitshow \
    && npm run build-menu \
    && node deploy.js menu bucket-name \
    && mkdir -p /usr/share/nginx/www/ \
    && cp -rf /front-end/dist/* /usr/share/nginx/www/ \
    && apk del nodejs \
    && rm -rf /front-end \
    && rm -rf /var/cache/apk/* /tmp/*
