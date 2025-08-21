import os from 'os';

export default function getIpAddress() {
  const interfaces = os.networkInterfaces();

  for (const name of Object.keys(interfaces))
    for (const iface of interfaces[name]!)
      if (iface.family === 'IPv4' && !iface.internal) return iface.address;
      else if (
        iface.family === 'IPv4' &&
        iface.internal &&
        iface.address === '127.0.0.1'
      )
        return iface.address;

  return '0.0.0.0';
}
