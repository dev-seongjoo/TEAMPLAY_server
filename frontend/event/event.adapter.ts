// import { IoAdapter } from '@nestjs/platform-socket.io';
// import { createClient } from 'redis';
// import { ServerOptions } from 'socket.io';
// import { createAdapter } from 'socket.io-redis';

// export class RedisIoAdapter extends IoAdapter {
//   async createIOServer(port: number, options?: ServerOptions): Promise<any> {
//     const pubClient = createClient({ url: 'redis://my_redis:6379' });
//     const subClient = pubClient.duplicate();

//     const redisAdapter = createAdapter({ pubClient, subClient });

//     await Promise.all([pubClient.connect(), subClient.connect()]);
//     const server = super.createIOServer(port, options);
//     server.adapter(redisAdapter);
//     return server;
//   }
// }

import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';

export class RedisIoAdapter extends IoAdapter {
  private adapterConstructor: ReturnType<typeof createAdapter>;

  async connectToRedis(): Promise<void> {
    const pubClient = createClient({ url: `redis://my_redis:6379` });
    const subClient = pubClient.duplicate();

    await Promise.all([pubClient.connect(), subClient.connect()]);

    this.adapterConstructor = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.adapterConstructor);
    return server;
  }
}
