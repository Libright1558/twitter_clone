import express from 'express';
import 'dotenv/config';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yaml';
import fs from 'fs';

try {
    const app = express();
    const swaggerFile = fs.readFileSync('./swagger/swagger.yml', 'utf8');
    const swaggerDocument = YAML.parse(swaggerFile);
    const port = process.env.swagger_port;
    app.listen(port, () => console.log('swagger server listening on port ' + port));
    app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
} catch (e) {
    console.log("swagger error: ", e);
}
