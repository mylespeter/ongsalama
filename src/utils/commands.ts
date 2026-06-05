
import { fileSystem } from './fileSystem';

export const executeCommand = (command: string): string[] => {
  if (!command.trim()) return [];
  
  const parts = command.trim().split(' ');
  const cmd = parts[0].toLowerCase();
  const args = parts.slice(1);
  
  try {
    switch (cmd) {
      case 'cd': {
        if (args.length > 1) return ['Trop de paramètres'];
        const path = args[0] || '\\';
        const result = fileSystem.cd(path);
        
        if (result && result !== '' && !result.toLowerCase().includes('changed to')) {
          return [result];
        }
        return [];
      }
      
      case 'dir': {
        const pattern = args[0];
        const items = fileSystem.dir(pattern);
        
        const filteredItems = items.filter(i => i.name !== '.' && i.name !== '..');
        const totalFiles = filteredItems.filter(i => !i.isDir).length;
        const totalDirs = filteredItems.filter(i => i.isDir).length;
        const totalSize = filteredItems.reduce((sum, item) => sum + item.size, 0);
        
        const output = [
          ` Répertoire de ${fileSystem.getCurrentPath()}`
        ];
        
        if (pattern) {
          output[0] += ` (filtre: ${pattern})`;
        }
        
        output.push('');
        
        if (items.length <= 2) {
          output.push('Aucun fichier trouvé');
        } else {
          items.forEach(item => {
            if (item.name === '.' || item.name === '..') return;
            
            // Formater la date: convertir de "MM-DD-YY" à "DD/MM/YYYY"
            const [month, day, yearShort] = item.date.split('-');
            const year = yearShort && yearShort.length === 2 ? `20${yearShort}` : '2026';
            const formattedDate = `${day.padStart(2, '0')}/${month.padStart(2, '0')}/${year}`;
            
            if (item.isDir) {
              // Pour les répertoires
              output.push(`${formattedDate}  ${item.time || '00:00'}    <DIR>          ${item.name}`);
            } else {
              // Pour les fichiers
              const sizeStr = item.size.toLocaleString();
              const paddedSize = sizeStr.padStart(15);
              output.push(`${formattedDate}  ${item.time || '00:00'}    ${paddedSize} ${item.name}`);
            }
          });
        }
        
        output.push(
          '',
          `    ${totalFiles} fichier(s)       ${totalSize.toLocaleString()} octets`,
          `    ${totalDirs} répertoire(s)`
        );
        
        return output;
      }
      


      case 'echo': {
  if (args.length === 0) {
    return ['ECHO est activé'];
  }
  
  let echoText = args.join(' ');
  let outputLine = '';
  
  // Gérer les variables d'environnement (version simple)
  if (echoText.includes('%')) {
    // Variables simples supportées
    const vars: { [key: string]: string } = {
      '%PATH%': 'C:\\WINDOWS;C:\\WINDOWS\\SYSTEM32',
      '%TEMP%': 'C:\\WINDOWS\\TEMP',
      '%WINDIR%': 'C:\\WINDOWS',
      '%SYSTEMROOT%': 'C:\\WINDOWS',
      '%COMPUTERNAME%': 'DOS-PC',
      '%USERNAME%': 'Jean',
      '%DATE%': new Date().toLocaleDateString('fr-FR'),
      '%TIME%': new Date().toLocaleTimeString('fr-FR'),
      '%CD%': fileSystem.getCurrentPath(),
      '%PROMPT%': '$P$G',
      '%OS%': 'MS-DOS',
      '%VERSION%': '6.22'
    };
    
    Object.keys(vars).forEach(varName => {
      if (echoText.includes(varName)) {
        echoText = echoText.replace(new RegExp(varName.replace(/%/g, '\\%'), 'g'), vars[varName]);
      }
    });
    
    // Supprimer les variables non reconnues
    echoText = echoText.replace(/%[^%]+%/g, '');
  }
  
  // Gérer ON/OFF
  if (args[0]?.toUpperCase() === 'ON') {
    return ['ECHO est activé'];
  } else if (args[0]?.toUpperCase() === 'OFF') {
    return ['ECHO est désactivé'];
  }
  
  // Supprimer les guillemets s'ils entourent toute la chaîne
  if ((echoText.startsWith('"') && echoText.endsWith('"')) || 
      (echoText.startsWith("'") && echoText.endsWith("'"))) {
    echoText = echoText.substring(1, echoText.length - 1);
  }
  
  outputLine = echoText;
  
  // Gérer la redirection vers un fichier
  const redirectionMatch = echoText.match(/^(.*?)\s*(>>|>)\s*(.+)$/);
  if (redirectionMatch) {
    const [, text, operator, filename] = redirectionMatch;
    const cleanText = text.trim();
    const cleanFilename = filename.trim();
    
    try {
      if (operator === '>') {
        // Écraser le fichier
        const fileCreated = fileSystem.echo(cleanText, cleanFilename, 'overwrite');
        if (fileCreated) {
          return [`Contenu écrit dans ${cleanFilename}`];
        }
      } else if (operator === '>>') {
        // Ajouter au fichier
        const fileAppended = fileSystem.echo(cleanText, cleanFilename, 'append');
        if (fileAppended) {
          return [`Contenu ajouté à ${cleanFilename}`];
        }
      }
    } catch (error: any) {
      return [error.message];
    }
  }
  
  return [outputLine];
}

      case 'tree': {
        const path = args[0] || '.';
        
        try {
          const originalPath = fileSystem.getCurrentPath();
          
          if (path !== '.') {
            fileSystem.cd(path);
          }
          
          const treeOutput = fileSystem.tree();
          
          if (path !== '.') {
            fileSystem.cd(originalPath);
          }
          
          return treeOutput;
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'mkdir':
      case 'md': {
        if (args.length === 0) return ['La syntaxe de la commande est incorrecte.'];
        const results = fileSystem.mkdir(args);
        return results;
      }
      
      case 'rmdir':
      case 'rd': {
        if (args.length === 0) return ['Paramètre requis manquant'];
        const { removed, errors } = fileSystem.rmdir(args);
        const output: string[] = [];
        
        if (removed.length > 0) {
          removed.forEach(dir => output.push(`Répertoire supprimé: ${dir}`));
        }
        
        if (errors.length > 0) {
          errors.forEach(error => output.push(`Erreur: ${error}`));
        }
        
        return output;
      }
      
      case 'touch': {
        if (args.length === 0) return ['La syntaxe de la commande est incorrecte.'];
        const results = fileSystem.touch(args);
        return results;
      }
      
      case 'type': {
        if (args.length !== 1) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const content = fileSystem.type(args[0]);
          return content ? content.split('\n') : ['(fichier vide)'];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'del':
      case 'effacer':
      case 'erase': {
        if (args.length === 0) return ['Paramètre requis manquant'];
        
        const files: string[] = [];
        let prompt = false;
        let quiet = false;
        
        for (const arg of args) {
          if (arg.startsWith('/')) {
            switch (arg.toLowerCase()) {
              case '/p':
                prompt = true;
                break;
              case '/q':
                quiet = true;
                break;
              default:
                return [`Commutation invalide - ${arg}`];
            }
          } else {
            files.push(arg);
          }
        }
        
        if (files.length === 0) {
          return ['Paramètre requis manquant'];
        }
        
        const { deleted, errors } = fileSystem.del(files);
        const output: string[] = [];
        
        if (prompt && deleted.length > 0) {
          output.push(`Supprimer ${deleted.join(', ')} ? (O/N)`);
          output.push('(Réponse Oui pour la simulation)');
        }
        
        if (deleted.length > 0 && !quiet) {
          deleted.forEach(file => output.push(`Supprimé: ${file}`));
        }
        
        if (errors.length > 0) {
          errors.forEach(error => output.push(error));
        }
        
        if (deleted.length === 0 && errors.length === 0 && !quiet) {
          output.push('Aucun fichier supprimé');
        }
        
        return output;
      }
      
      case 'ren':
      case 'rename':
      case 'renommer': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.rename(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'move':
      case 'deplacer': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.move(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'copy':
      case 'copier': {
        if (args.length !== 2) return ['La syntaxe de la commande est incorrecte.'];
        try {
          const result = fileSystem.copy(args[0], args[1]);
          return [result];
        } catch (error: any) {
          return [error.message];
        }
      }
      
      case 'cls':
      case 'clear':
      case 'nettoyer': {
        return ['_CLEAR_'];
      }
      
      case 'help':
      case 'aide': {
        return [
          'Commandes DOS:',
          '════════════════════════════════════════════════════',
          'CD      [répertoire]  - Changer de répertoire',
          'DIR     [pattern]     - Lister les fichiers (jokers supportés)',
          'TREE    [répertoire]  - Afficher l\'arborescence des répertoires',
          'MD/MKDIR [chemins...] - Créer des répertoires',
          'RD/RMDIR [rép...]     - Supprimer des répertoires vides',
          'TOUCH   [fichiers...] - Créer/mettre à jour des fichiers',
          'TYPE    [fichier]     - Voir le contenu d\'un fichier',
          'DEL/EFFACER [fichiers...] - Supprimer des fichiers',
          '          /P           - Demander confirmation',
          '          /Q           - Mode silencieux',
          'REN/RENAME [ancien] [nouveau] - Renommer un fichier',
          'MOVE    [source] [dest] - Déplacer un fichier',
          'COPY    [source] [dest] - Copier un fichier',
          'CLS                    - Effacer l\'écran',
          'HELP                   - Afficher cette aide',
          '',
          'Règles de noms de fichiers:',
          '  • Les espaces sont autorisés',
          '  • Les noms longs sont autorisés (max 255 caractères)',
          '  • Interdit: < > : " | et caractères de contrôle',
          '  • Les points multiples sont autorisés',
          '',
          'Exemples:',
          '  dir *.txt              (liste uniquement les fichiers .txt)',
          '  dir C*.*               (liste les fichiers commençant par C)',
          '  touch "mon fichier.txt" (créer un fichier avec espace)',
          '  touch rapport.v2.final.docx',
          '  ren old.txt "nouveau nom.txt"',
          '',
          'Note: MD=MKDIR, RD=RMDIR, DEL=EFFACER, REN=RENAME, MOVE=DEPLACER, COPY=COPIER'
        ];
      }
      
      case 'ver':
      case 'version': {
        return [
          'MS-DOS Version 6.22',
          'Copyright Microsoft Corp 1981-1993'
        ];
      }
      
      default: {
        return [`'${cmd}' n\'est pas reconnu en tant que commande interne ou externe,`,
                'programme exécutable ou fichier de commandes.'];
      }
    }
  } catch (error: any) {
    return [error.message || 'Une erreur inconnue s\'est produite'];
  }
};