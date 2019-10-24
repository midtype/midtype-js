export const uppercase = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

export const accessValue = (node: any, val: string): string => {
  const split = val.split('.');
  if (split.length > 1 && node[split[0]]) {
    return accessValue(node[split[0]], split.slice(1).join('.'));
  }
  return node[val];
};

export const parsedFieldToQuery = (fields: any) => {
  let q = '';
  Object.keys(fields).forEach(field => {
    q = `${q}${field}${
      fields[field] ? ` {\n${parsedFieldToQuery(fields[field])}}\n` : '\n'
    }`;
  });
  return q;
};

export const isGraphObject = (obj: string) =>
  obj.endsWith('Connection') ||
  obj.endsWith('Edge') ||
  obj.endsWith('Payload') ||
  obj.startsWith('__') ||
  obj === 'Query' ||
  obj === 'Mutation';
