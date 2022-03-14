const fs = require('fs');

const isDockerEnv = () => {
  if (fs.existsSync('/.dockerenv')) {
    return true;
  }

  if (fs.existsSync('/proc/self/cgroup')) {
    const fileData = fs.readFileSync('/proc/self/cgroup', 'utf8');
    if (fileData instanceof Error) {
      return false;
    }

    return fileData.includes('docker');
  }

  return false;
};

module.exports = isDockerEnv;
