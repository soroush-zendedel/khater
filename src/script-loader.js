export function loadClassicScripts(sources) {
  return sources.reduce(
    (chain, source) => chain.then(() => loadClassicScript(source)),
    Promise.resolve(),
  );
}

function loadClassicScript(source) {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = source;
    script.async = false;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Failed to load script: ${source}`));
    document.head.append(script);
  });
}
