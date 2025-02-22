interface IConfig {
    prefix: string;
    port: number;
    secret: string;
    google: {
      clientId: string;
      clientSecret: string;
      callbackURL?: string;
    };
    database:{
      host:string;
      port:number;
      username:string;
      password:string;
      database:string;
      synchronize:boolean;
      type?:string;
    };
    mail:{
      host:string;
      port?:number;
      auth:{
        user:string;
        pass:string;
      },
      from:string;
    }

    
  }

  export const config = ():IConfig =>({
    prefix: process.env.PREFIX || 'api',
    port: parseInt(process.env.PORT, 10) || 3000,
    secret: process.env.SECRET || 'secret',
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || 'google-client-id',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'google-client-secret',
        callbackURL: process.env.GOOGLE_CALLBACK_URL || 'http://localhost:3000/login',
    },
    database:{
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      database: process.env.DB_NAME || 'database',
      synchronize: process.env.DB_SYNCHRONIZE === 'true' || false,
      type: process.env.DB_TYPE || 'postgres',
    },
    mail:{
      host: process.env.MAIL_HOST || 'smtp.mailtrap.io',
      auth:{
        user: process.env.MAIL_USER || 'user',
        pass: process.env.MAIL_PASS || 'pass'
      },
      port: parseInt(process.env.MAIL_PORT, 10) || 587,
      from: process.env.MAIL_FROM || ''
    }
    

  })