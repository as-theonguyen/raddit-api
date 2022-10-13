import { ConfigService } from '@nestjs/config';
import { initialize } from '@src/initialize';

const bootstrap = async () => {
  const app = await initialize();

  const configService = app.get(ConfigService);

  await app.listen(configService.get('port'));
};

bootstrap().catch(console.log);
