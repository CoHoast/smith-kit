import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

interface NpmPackage {
  'dist-tags': { latest: string };
  time?: Record<string, string>;
}

// POST /api/depwatch/scan - Scan a project for dependencies
export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { project_id } = await request.json();

  if (!project_id) {
    return NextResponse.json({ error: 'project_id is required' }, { status: 400 });
  }

  // Get project and verify ownership
  const { data: project } = await supabase
    .from('depwatch_projects')
    .select('*')
    .eq('id', project_id)
    .eq('user_id', user.id)
    .single();

  if (!project) {
    return NextResponse.json({ error: 'Project not found' }, { status: 404 });
  }

  try {
    // Parse GitHub URL to get owner/repo
    const githubUrl = project.github_url;
    const match = githubUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
    if (!match) {
      return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
    }
    const [, owner, repo] = match;
    const repoName = repo.replace(/\.git$/, '');

    // Fetch package.json from GitHub
    const packageJsonUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/main/package.json`;
    const packageJsonRes = await fetch(packageJsonUrl);
    
    if (!packageJsonRes.ok) {
      // Try master branch
      const masterUrl = `https://raw.githubusercontent.com/${owner}/${repoName}/master/package.json`;
      const masterRes = await fetch(masterUrl);
      if (!masterRes.ok) {
        return NextResponse.json({ error: 'Could not find package.json' }, { status: 404 });
      }
    }

    const packageJson: PackageJson = await packageJsonRes.json();
    
    // Combine dependencies
    const allDeps = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies,
    };

    // Clear existing dependencies for this project
    await supabase
      .from('depwatch_dependencies')
      .delete()
      .eq('project_id', project_id);

    // Check each dependency
    const dependencies = [];
    for (const [name, version] of Object.entries(allDeps)) {
      const cleanVersion = version.replace(/[\^~>=<]/g, '');
      
      // Fetch latest version from npm registry
      let latestVersion = cleanVersion;
      let isOutdated = false;
      let vulnerabilitySeverity = null;
      
      try {
        const npmRes = await fetch(`https://registry.npmjs.org/${name}`);
        if (npmRes.ok) {
          const npmData: NpmPackage = await npmRes.json();
          latestVersion = npmData['dist-tags']?.latest || cleanVersion;
          
          // Simple version comparison (major version only for now)
          const currentMajor = parseInt(cleanVersion.split('.')[0]) || 0;
          const latestMajor = parseInt(latestVersion.split('.')[0]) || 0;
          const currentMinor = parseInt(cleanVersion.split('.')[1]) || 0;
          const latestMinor = parseInt(latestVersion.split('.')[1]) || 0;
          
          if (latestMajor > currentMajor) {
            isOutdated = true;
            vulnerabilitySeverity = 'high'; // Major version behind
          } else if (latestMajor === currentMajor && latestMinor > currentMinor + 5) {
            isOutdated = true;
            vulnerabilitySeverity = 'medium'; // Minor version significantly behind
          } else if (cleanVersion !== latestVersion) {
            isOutdated = true;
          }
        }
      } catch (e) {
        // Ignore npm fetch errors
      }

      dependencies.push({
        project_id,
        name,
        current_version: cleanVersion,
        latest_version: latestVersion,
        is_outdated: isOutdated,
        is_dev_dependency: !!packageJson.devDependencies?.[name],
        vulnerability_severity: vulnerabilitySeverity,
      });
    }

    // Insert all dependencies
    if (dependencies.length > 0) {
      const { error: insertError } = await supabase
        .from('depwatch_dependencies')
        .insert(dependencies);

      if (insertError) {
        console.error('Insert error:', insertError);
      }
    }

    // Update project last_scanned_at
    await supabase
      .from('depwatch_projects')
      .update({ last_scanned_at: new Date().toISOString() })
      .eq('id', project_id);

    return NextResponse.json({ 
      success: true, 
      dependencies_count: dependencies.length,
      outdated_count: dependencies.filter(d => d.is_outdated).length,
      vulnerability_count: dependencies.filter(d => d.vulnerability_severity).length,
    });

  } catch (error: any) {
    console.error('Scan error:', error);
    return NextResponse.json({ error: error.message || 'Scan failed' }, { status: 500 });
  }
}
