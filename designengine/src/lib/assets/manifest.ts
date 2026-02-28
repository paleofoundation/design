export interface AssetEntry {
  path: string;
  type: 'svg' | 'png' | 'css' | 'js' | 'json';
  category: 'favicon' | 'pattern' | 'divider' | 'hero' | 'animation' | 'manifest';
  description: string;
  encoding: 'utf-8' | 'base64';
  usage?: string;
}

export interface AssetManifest {
  version: string;
  generated: string;
  profile: {
    name: string;
    colors: {
      primary: string;
      secondary: string;
      accent: string;
      background: string;
    };
  };
  artStyle: {
    type: string;
    palette: string[];
    mood: string;
    prompt_suffix: string;
  };
  files: AssetEntry[];
  htmlHead: string;
  cssImports: string[];
}

export function buildManifest(opts: {
  projectName: string;
  colors: { primary: string; secondary: string; accent: string; background: string };
  files: AssetEntry[];
  htmlHead: string;
}): AssetManifest {
  const cssImports = opts.files
    .filter(f => f.type === 'css')
    .map(f => `@import url('./${f.path}');`);

  return {
    version: '1.0.0',
    generated: new Date().toISOString(),
    profile: {
      name: opts.projectName,
      colors: opts.colors,
    },
    artStyle: {
      type: 'programmatic-svg',
      palette: [opts.colors.primary, opts.colors.secondary, opts.colors.accent],
      mood: 'derived from design tokens',
      prompt_suffix: `Use colors ${opts.colors.primary}, ${opts.colors.secondary}, and ${opts.colors.accent} for all generated visuals. Maintain consistency with the ${opts.projectName} brand.`,
    },
    files: opts.files,
    htmlHead: opts.htmlHead,
    cssImports,
  };
}
