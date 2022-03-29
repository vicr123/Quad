#!/usr/bin/bash
pg_isready > /dev/null || sudo systemctl start postgresql

node index.js
