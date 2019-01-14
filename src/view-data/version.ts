const versionRegEx = /\/api\/(v\d+)\//;

export function getVersion(path: string): string {
  const version = versionRegEx.exec(path);
  // TODO: This only supports versions until v9, v10 will return 1?
  return (version && version[1]) || "v0";
}

export function getIntVersion(path: string): number {
  return parseInt(getVersion(path).substr(1));
}
