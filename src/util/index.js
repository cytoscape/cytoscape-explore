export const isServer = () => typeof window === typeof undefined;

export const isClient = () => !isServer();
