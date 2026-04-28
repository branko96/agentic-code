# e2e

Reading files directly.I can proceed, but I need your choice because stopping PID 9077 is destructive to another local app.

I’m blocked on real verification until you choose how to handle the port 3001 conflict.

1. **Use new port (recommended)** — I’ll reconfigure the test backend to another port and run the login E2E flow there.
2. **Stop PID 9077** — I’ll stop the existing `bun` process on 3001 and verify on that port.
3. **Different env** — you want a different local environment.

Reply with 1, 2, or 3.
