
// // app/api/tunnel/route.ts
// import { NextResponse } from 'next/server';
// import { exec } from 'child_process';
// import { promisify } from 'util';

// const execAsync = promisify(exec);

// // Variable pour suivre l'état du tunnel
// let tunnelProcess: any = null;
// let currentUrl: string | null = null;
// let tunnelStartTime: number | null = null;

// // Fonction pour installer cloudflared via winget
// async function installCloudflared(): Promise<boolean> {
//   try {
//     await execAsync('winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements');
//     return true;
//   } catch {
//     try {
//       await execAsync('powershell -Command "winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements"');
//       return true;
//     } catch {
//       return false;
//     }
//   }
// }

// // Fonction pour vérifier si cloudflared est accessible
// async function verifyCloudflaredInPath(): Promise<boolean> {
//   try {
//     await execAsync('cloudflared --version');
//     return true;
//   } catch {
//     return false;
//   }
// }

// export async function POST() {
//   try {
//     // Si un tunnel existe déjà, vérifier qu'il tourne encore
//     if (currentUrl && tunnelProcess) {
//       try {
//         process.kill(tunnelProcess.pid!, 0);
//         return NextResponse.json({ 
//           url: currentUrl,
//           status: 'active',
//           startedAt: tunnelStartTime
//         });
//       } catch {
//         currentUrl = null;
//         tunnelProcess = null;
//         tunnelStartTime = null;
//       }
//     }

//     // Vérifier si Windows
//     if (process.platform !== 'win32') {
//       return NextResponse.json(
//         { error: 'Cette installation est conçue pour Windows.' },
//         { status: 400 }
//       );
//     }

//     // Vérifier/corriger l'installation de cloudflared
//     let isInstalled = await verifyCloudflaredInPath();
    
//     if (!isInstalled) {
//       const installSuccess = await installCloudflared();
      
//       if (!installSuccess) {
//         return NextResponse.json({
//           error: 'Cloudflared n\'a pas pu être installé automatiquement.',
//           instructions: {
//             title: 'Installation manuelle requise',
//             steps: [
//               'winget install --id Cloudflare.cloudflared',
//               'Ou téléchargez: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
//             ]
//           }
//         }, { status: 500 });
//       }
      
//       await new Promise(resolve => setTimeout(resolve, 3000));
//     }

//     const cloudflaredAvailable = await verifyCloudflaredInPath();
//     if (!cloudflaredAvailable) {
//       return NextResponse.json({
//         error: 'Cloudflared est installé mais n\'est pas accessible. Redémarrez votre terminal.'
//       }, { status: 500 });
//     }

//     // Démarrer un nouveau tunnel
//     const port = process.env.PORT || 3000;
    
//     return new Promise((resolve) => {
//       const child = exec(
//         `cloudflared tunnel --url http://localhost:${port} --no-autoupdate`,
//         {
//           windowsHide: true,
//           maxBuffer: 1024 * 1024 * 10
//         }
//       );

//       let outputBuffer = '';
//       let resolved = false;

//       const handleOutput = (data: string) => {
//         outputBuffer += data;
        
//         // Chercher l'URL trycloudflare.com
//         const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        
//         if (urlMatch && !resolved) {
//           resolved = true;
//           const url = urlMatch[0];
          
//           currentUrl = url;
//           tunnelProcess = child;
//           tunnelStartTime = Date.now();
          
//           console.log(`✅ Tunnel: ${url}`);
          
//           resolve(NextResponse.json({ 
//             url: url,
//             status: 'active',
//             startedAt: tunnelStartTime
//           }));
//         }
//       };

//       child.stdout?.on('data', handleOutput);
//       child.stderr?.on('data', handleOutput);

//       // Timeout après 30 secondes
//       setTimeout(() => {
//         if (!resolved) {
//           const lastMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
//           if (lastMatch) {
//             const url = lastMatch[0];
//             currentUrl = url;
//             tunnelProcess = child;
//             tunnelStartTime = Date.now();
//             resolved = true;
//             console.log(`✅ Tunnel: ${url}`);
//             resolve(NextResponse.json({ 
//               url: url,
//               status: 'active',
//               startedAt: tunnelStartTime
//             }));
//           } else {
//             child.kill();
//             resolve(
//               NextResponse.json(
//                 { error: 'Timeout: Impossible de créer le tunnel.' },
//                 { status: 408 }
//               )
//             );
//           }
//         }
//       }, 30000);

//       child.on('error', (err) => {
//         if (!resolved) {
//           resolved = true;
//           resolve(
//             NextResponse.json(
//               { error: 'Erreur cloudflared: ' + err.message },
//               { status: 500 }
//             )
//           );
//         }
//       });

//       child.on('close', (code) => {
//         if (code !== 0 && !resolved) {
//           resolved = true;
//           resolve(
//             NextResponse.json(
//               { error: `Tunnel arrêté (code ${code}).` },
//               { status: 500 }
//             )
//           );
//         }
//         if (currentUrl === (outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)?.[0])) {
//           currentUrl = null;
//           tunnelProcess = null;
//           tunnelStartTime = null;
//         }
//       });
//     });
//   } catch (error: any) {
//     console.error('Erreur tunnel:', error.message);
//     return NextResponse.json(
//       { error: error.message || 'Erreur interne' },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE() {
//   if (tunnelProcess) {
//     try {
//       tunnelProcess.kill('SIGTERM');
      
//       // Forcer l'arrêt sur Windows
//       if (process.platform === 'win32') {
//         try {
//           const killProcess = exec(`taskkill /pid ${tunnelProcess.pid} /T /F`);
//           // Ignorer les erreurs de taskkill
//           killProcess.on('error', () => {});
//           killProcess.stderr?.on('data', () => {});
//         } catch {
//           // Ignorer si taskkill échoue
//         }
//       }
//     } catch {
//       // Ignorer les erreurs
//     }
    
//     tunnelProcess = null;
//     currentUrl = null;
//     tunnelStartTime = null;
//     console.log('🔴 Tunnel arrêté');
//     return NextResponse.json({ message: 'Tunnel arrêté' });
//   }
//   return NextResponse.json({ message: 'Aucun tunnel actif' });
// }

// export async function GET() {
//   if (currentUrl && tunnelProcess) {
//     try {
//       process.kill(tunnelProcess.pid!, 0);
//       return NextResponse.json({ 
//         active: true, 
//         url: currentUrl,
//         startedAt: tunnelStartTime,
//         uptime: tunnelStartTime ? Math.floor((Date.now() - tunnelStartTime) / 1000) : 0
//       });
//     } catch {
//       currentUrl = null;
//       tunnelProcess = null;
//       tunnelStartTime = null;
//     }
//   }
  
//   return NextResponse.json({ active: false, url: null });
// }

// app/api/tunnel/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Variable pour suivre l'état du tunnel
let tunnelProcess: any = null;
let currentUrl: string | null = null;
let tunnelStartTime: number | null = null;

// Fonction pour installer cloudflared via winget
async function installCloudflared(): Promise<boolean> {
  try {
    await execAsync('winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements');
    return true;
  } catch {
    try {
      await execAsync('powershell -Command "winget install --id Cloudflare.cloudflared --silent --accept-package-agreements --accept-source-agreements"');
      return true;
    } catch {
      return false;
    }
  }
}

// Fonction pour vérifier si cloudflared est accessible
async function verifyCloudflaredInPath(): Promise<boolean> {
  try {
    await execAsync('cloudflared --version');
    return true;
  } catch {
    return false;
  }
}

export async function POST(): Promise<NextResponse> {
  try {
    // Si un tunnel existe déjà, vérifier qu'il tourne encore
    if (currentUrl && tunnelProcess) {
      try {
        process.kill(tunnelProcess.pid!, 0);
        return NextResponse.json({ 
          url: currentUrl,
          status: 'active',
          startedAt: tunnelStartTime
        });
      } catch {
        currentUrl = null;
        tunnelProcess = null;
        tunnelStartTime = null;
      }
    }

    // Vérifier si Windows
    if (process.platform !== 'win32') {
      return NextResponse.json(
        { error: 'Cette installation est conçue pour Windows.' },
        { status: 400 }
      );
    }

    // Vérifier/corriger l'installation de cloudflared
    let isInstalled = await verifyCloudflaredInPath();
    
    if (!isInstalled) {
      const installSuccess = await installCloudflared();
      
      if (!installSuccess) {
        return NextResponse.json({
          error: 'Cloudflared n\'a pas pu être installé automatiquement.',
          instructions: {
            title: 'Installation manuelle requise',
            steps: [
              'winget install --id Cloudflare.cloudflared',
              'Ou téléchargez: https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/'
            ]
          }
        }, { status: 500 });
      }
      
      await new Promise(resolve => setTimeout(resolve, 3000));
    }

    const cloudflaredAvailable = await verifyCloudflaredInPath();
    if (!cloudflaredAvailable) {
      return NextResponse.json({
        error: 'Cloudflared est installé mais n\'est pas accessible. Redémarrez votre terminal.'
      }, { status: 500 });
    }

    // Démarrer un nouveau tunnel
    const port = process.env.PORT || 3000;
    
    return new Promise<NextResponse>((resolve) => {
      const child = exec(
        `cloudflared tunnel --url http://localhost:${port} --no-autoupdate`,
        {
          windowsHide: true,
          maxBuffer: 1024 * 1024 * 10
        }
      );

      let outputBuffer = '';
      let resolved = false;

      const handleOutput = (data: string) => {
        outputBuffer += data;
        
        // Chercher l'URL trycloudflare.com
        const urlMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
        
        if (urlMatch && !resolved) {
          resolved = true;
          const url = urlMatch[0];
          
          currentUrl = url;
          tunnelProcess = child;
          tunnelStartTime = Date.now();
          
          console.log(`✅ Tunnel: ${url}`);
          
          resolve(NextResponse.json({ 
            url: url,
            status: 'active',
            startedAt: tunnelStartTime
          }));
        }
      };

      child.stdout?.on('data', handleOutput);
      child.stderr?.on('data', handleOutput);

      // Timeout après 30 secondes
      setTimeout(() => {
        if (!resolved) {
          const lastMatch = outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);
          if (lastMatch) {
            const url = lastMatch[0];
            currentUrl = url;
            tunnelProcess = child;
            tunnelStartTime = Date.now();
            resolved = true;
            console.log(`✅ Tunnel: ${url}`);
            resolve(NextResponse.json({ 
              url: url,
              status: 'active',
              startedAt: tunnelStartTime
            }));
          } else {
            child.kill();
            resolve(
              NextResponse.json(
                { error: 'Timeout: Impossible de créer le tunnel.' },
                { status: 408 }
              )
            );
          }
        }
      }, 30000);

      child.on('error', (err) => {
        if (!resolved) {
          resolved = true;
          resolve(
            NextResponse.json(
              { error: 'Erreur cloudflared: ' + err.message },
              { status: 500 }
            )
          );
        }
      });

      child.on('close', (code) => {
        if (code !== 0 && !resolved) {
          resolved = true;
          resolve(
            NextResponse.json(
              { error: `Tunnel arrêté (code ${code}).` },
              { status: 500 }
            )
          );
        }
        if (currentUrl === (outputBuffer.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/)?.[0])) {
          currentUrl = null;
          tunnelProcess = null;
          tunnelStartTime = null;
        }
      });
    });
  } catch (error: any) {
    console.error('Erreur tunnel:', error.message);
    return NextResponse.json(
      { error: error.message || 'Erreur interne' },
      { status: 500 }
    );
  }
}

export async function DELETE(): Promise<NextResponse> {
  if (tunnelProcess) {
    try {
      tunnelProcess.kill('SIGTERM');
      
      // Forcer l'arrêt sur Windows
      if (process.platform === 'win32') {
        try {
          const killProcess = exec(`taskkill /pid ${tunnelProcess.pid} /T /F`);
          // Ignorer les erreurs de taskkill
          killProcess.on('error', () => {});
          killProcess.stderr?.on('data', () => {});
        } catch {
          // Ignorer si taskkill échoue
        }
      }
    } catch {
      // Ignorer les erreurs
    }
    
    tunnelProcess = null;
    currentUrl = null;
    tunnelStartTime = null;
    console.log('🔴 Tunnel arrêté');
    return NextResponse.json({ message: 'Tunnel arrêté' });
  }
  return NextResponse.json({ message: 'Aucun tunnel actif' });
}

export async function GET(): Promise<NextResponse> {
  if (currentUrl && tunnelProcess) {
    try {
      process.kill(tunnelProcess.pid!, 0);
      return NextResponse.json({ 
        active: true, 
        url: currentUrl,
        startedAt: tunnelStartTime,
        uptime: tunnelStartTime ? Math.floor((Date.now() - tunnelStartTime) / 1000) : 0
      });
    } catch {
      currentUrl = null;
      tunnelProcess = null;
      tunnelStartTime = null;
    }
  }
  
  return NextResponse.json({ active: false, url: null });
}