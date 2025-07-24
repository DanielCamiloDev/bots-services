// Clave secreta y opciones de expiración
export const jwtConstants = {
    secret: process.env.JWT_SECRET || 'TU_SECRETO_SEGURO',
    expiresIn: '1h',
  };