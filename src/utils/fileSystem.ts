
interface FileSystemItem {
  name: string;
  type: 'file' | 'dir';
  content?: string;
  size: number;
  created: string;
  children?: Map<string, FileSystemItem>;
  parent?: FileSystemItem;
}

export class VirtualFileSystem {
  private currentDir: FileSystemItem;
  private root: FileSystemItem;
  
  constructor() {
    const now = this.getDOSDate();
    
    this.root = {
      name: 'C:',
      type: 'dir',
      size: 0,
      created: now,
      children: new Map()
    };
    
    this.initializeFileSystem();
    this.currentDir = this.root;
  }
  
  private initializeFileSystem(): void {
    const now = this.getDOSDate();
    
    // Créer la structure racine
    const rootDirectories = ['Intel', 'PerfLogs', 'Program Files', 'Program Files (x86)', 'Users', 'Windows'];
    
    rootDirectories.forEach(dirName => {
      const dir: FileSystemItem = {
        name: dirName,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: this.root
      };
      this.root.children!.set(dirName, dir);
    });
    
    // ===== WINDOWS =====
    const windowsDir = this.root.children!.get('Windows')!;
    const windowsSubDirs = [
      'System32', 'System', 'SysWOW64', 'Temp', 'Fonts', 'Boot', 
      'Help', 'Media', 'Resources', 'WinSxS', 'Web', 'Cursors'
    ];
    
    windowsSubDirs.forEach(subDir => {
      windowsDir.children!.set(subDir, {
        name: subDir,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: windowsDir
      });
    });
    
    // Ajouter des fichiers systèmes dans Windows
    const windowsFiles = [
      { name: 'explorer.exe', size: 2872320, content: 'Windows Explorer - Gestionnaire de fichiers' },
      { name: 'notepad.exe', size: 193024, content: 'Bloc-notes Windows' },
      { name: 'cmd.exe', size: 290816, content: 'Invite de commandes Windows' },
      { name: 'regedit.exe', size: 373760, content: 'Éditeur du Registre' },
      { name: 'win.ini', size: 215, content: '[Windows]\r\nload=\r\nrun=\r\nNullPort=None\r\n[Desktop]\r\nWallpaper=(None)\r\nTileWallpaper=0\r\nWallpaperStyle=0\r\n[Sound]\r\nSystemDefault=ding.wav,Default Beep\r\n' },
      { name: 'system.ini', size: 178, content: '[boot]\r\nshell=explorer.exe\r\n[386Enh]\r\ndevice=vmm32.vxd\r\n' },
      { name: 'winhelp.hlp', size: 102400, content: 'Aide Windows' }
    ];
    
    windowsFiles.forEach(file => {
      windowsDir.children!.set(file.name, {
        name: file.name,
        type: 'file',
        content: file.content,
        size: file.size,
        created: now,
        parent: windowsDir
      });
    });
    
    // ===== PROGRAM FILES =====
    const programFilesDir = this.root.children!.get('Program Files')!;
    const programSubDirs = [
      'Common Files', 'Internet Explorer', 'Windows Defender', 
      'Windows Media Player', 'Windows NT', 'Windows Photo Viewer'
    ];
    
    programSubDirs.forEach(subDir => {
      programFilesDir.children!.set(subDir, {
        name: subDir,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: programFilesDir
      });
    });
    
    // Ajouter Microsoft Office
    programFilesDir.children!.set('Microsoft Office', {
      name: 'Microsoft Office',
      type: 'dir',
      size: 0,
      created: now,
      children: new Map(),
      parent: programFilesDir
    });
    
    const officeDir = programFilesDir.children!.get('Microsoft Office')!;
    const officeFiles = [
      { name: 'WINWORD.EXE', size: 13209600, content: 'Microsoft Word' },
      { name: 'EXCEL.EXE', size: 11509760, content: 'Microsoft Excel' },
      { name: 'POWERPNT.EXE', size: 10450944, content: 'Microsoft PowerPoint' },
      { name: 'OUTLOOK.EXE', size: 14348288, content: 'Microsoft Outlook' }
    ];
    
    officeFiles.forEach(file => {
      officeDir.children!.set(file.name, {
        name: file.name,
        type: 'file',
        content: file.content,
        size: file.size,
        created: now,
        parent: officeDir
      });
    });
    
    // ===== PROGRAM FILES (x86) =====
    const programFilesX86Dir = this.root.children!.get('Program Files (x86)')!;
    const x86SubDirs = [
      'Common Files', 'Internet Explorer', 'Microsoft.NET', 
      'Windows Mail', 'Windows Media Player'
    ];
    
    x86SubDirs.forEach(subDir => {
      programFilesX86Dir.children!.set(subDir, {
        name: subDir,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: programFilesX86Dir
      });
    });
    
    // ===== USERS =====
    const usersDir = this.root.children!.get('Users')!;
    
    // Créer les utilisateurs
    const userJean: FileSystemItem = {
      name: 'Jean',
      type: 'dir',
      size: 0,
      created: now,
      children: new Map(),
      parent: usersDir
    };
    
    const userPublic: FileSystemItem = {
      name: 'Public',
      type: 'dir',
      size: 0,
      created: now,
      children: new Map(),
      parent: usersDir
    };
    
    usersDir.children!.set('Jean', userJean);
    usersDir.children!.set('Public', userPublic);
    
    // Dossiers par défaut
    const defaultUserFolders = ['Documents', 'Downloads', 'Music', 'Pictures', 'Videos', 'Desktop'];
    
    // Créer les dossiers pour Jean
    defaultUserFolders.forEach(folder => {
      userJean.children!.set(folder, {
        name: folder,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: userJean
      });
      
      // Ajouter quelques fichiers d'exemple
      if (folder === 'Documents') {
        const docsDir = userJean.children!.get('Documents')!;
        docsDir.children!.set('CV.doc', {
          name: 'CV.doc',
          type: 'file',
          content: 'Curriculum Vitae de Jean Dupont\n\nExpérience professionnelle:\n- Développeur Senior (2018-Présent)\n- Analyste Programmeur (2015-2018)\n\nCompétences: JavaScript, TypeScript, React, Node.js',
          size: 5120,
          created: now,
          parent: docsDir
        });
        
        docsDir.children!.set('notes.txt', {
          name: 'notes.txt',
          type: 'file',
          content: 'Notes importantes:\n1. Réunion avec l\'équipe mercredi\n2. Livrer le projet vendredi\n3. Appeler le client lundi',
          size: 256,
          created: now,
          parent: docsDir
        });
      }
    });
    
    // Créer les dossiers pour Public
    defaultUserFolders.forEach(folder => {
      userPublic.children!.set(folder, {
        name: folder,
        type: 'dir',
        size: 0,
        created: now,
        children: new Map(),
        parent: userPublic
      });
    });
    
    // ===== FICHIERS RACINE =====
    const rootFiles = [
      { name: 'AUTOEXEC.BAT', content: '@echo off\r\nPATH=C:\\WINDOWS;C:\\WINDOWS\\SYSTEM32\r\nPROMPT $P$G\r\nSET TEMP=C:\\WINDOWS\\TEMP\r\n', size: 128 },
      { name: 'CONFIG.SYS', content: 'DEVICE=C:\\WINDOWS\\HIMEM.SYS\r\nDOS=HIGH\r\nFILES=40\r\nBUFFERS=20\r\nSTACKS=9,256\r\n', size: 96 },
      { name: 'COMMAND.COM', content: 'Interpréteur de commandes MS-DOS', size: 54613 },
      { name: 'BOOT.INI', content: '[boot loader]\r\ntimeout=30\r\ndefault=multi(0)disk(0)rdisk(0)partition(1)\\WINDOWS\r\n[operating systems]\r\nmulti(0)disk(0)rdisk(0)partition(1)\\WINDOWS="Microsoft Windows XP Professional" /fastdetect\r\n', size: 256 },
      { name: 'LISEZMOI.TXT', content: 'Bienvenue dans le terminal MS-DOS\r\n\r\nCeci est une simulation de MS-DOS 6.22\r\nTapez AIDE pour voir les commandes disponibles.', size: 130 }
    ];
    
    rootFiles.forEach(file => {
      this.root.children!.set(file.name, {
        name: file.name,
        type: 'file',
        content: file.content,
        size: file.size,
        created: now,
        parent: this.root
      });
    });
  }
  
  private getDOSDate(): string {
    const now = new Date();
    const year = now.getFullYear().toString().slice(-2);
    const month = (now.getMonth() + 1).toString().padStart(2, '0');
    const day = now.getDate().toString().padStart(2, '0');
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    
    return `${month}-${day}-${year} ${hours}:${minutes}`;
  }
  
  // VALIDATION AMÉLIORÉE - Accepter presque tous les noms
  private validateName(name: string): boolean {
    if (!name || name.trim().length === 0) {
      return false;
    }
    
    const trimmedName = name.trim();
    
    // Noms spéciaux autorisés
    if (trimmedName === '.' || trimmedName === '..') {
      return true;
    }
    
    // Vérifier les wildcards pour les patterns de recherche
    if (trimmedName.includes('*') || trimmedName.includes('?')) {
      return this.isValidWildcardPattern(trimmedName);
    }
    
    // Caractères interdits (très limités)
    const invalidChars = /[\x00-\x1F\x7F<>:"|]/; // Caractères de contrôle, <, >, :, ", |
    
    if (invalidChars.test(trimmedName)) {
      return false;
    }
    
    // Éviter les noms réservés Windows
    const reservedNames = ['CON', 'PRN', 'AUX', 'NUL', 'COM1', 'COM2', 'COM3', 'COM4', 
                          'COM5', 'COM6', 'COM7', 'COM8', 'COM9', 'LPT1', 'LPT2', 
                          'LPT3', 'LPT4', 'LPT5', 'LPT6', 'LPT7', 'LPT8', 'LPT9'];
    
    const nameUpper = trimmedName.toUpperCase();
    const nameWithoutExt = nameUpper.split('.')[0];
    
    if (reservedNames.includes(nameWithoutExt)) {
      return false;
    }
    
    // Éviter de finir par un point ou un espace
    if (trimmedName.endsWith('.') || trimmedName.endsWith(' ')) {
      return false;
    }
    
    // Limite de longueur généreuse
    if (trimmedName.length > 255) {
      return false;
    }
    
    return true;
  }
  
  private isValidWildcardPattern(pattern: string): boolean {
    const regex = /^[A-Za-z0-9_\-\.\s\$*?]*$/;
    return regex.test(pattern);
  }
  
  private patternToRegex(pattern: string): RegExp {
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.');
    return new RegExp(`^${escaped}$`, 'i');
  }
  echo(text: string, fileName: string, mode: 'append' | 'overwrite' = 'overwrite'): boolean {
  if (!fileName || fileName.trim() === '') {
    throw new Error('Nom de fichier requis');
  }
  
  const trimmedName = fileName.trim();
  
  if (!this.validateName(trimmedName)) {
    throw new Error(`Nom de fichier invalide : "${trimmedName}"`);
  }
  
  const existing = Array.from(this.currentDir.children?.entries() || [])
    .find(([key]) => key.toLowerCase() === trimmedName.toLowerCase());
  
  const now = this.getDOSDate();
  
  if (mode === 'overwrite') {
    // Écraser ou créer le fichier
    this.currentDir.children!.set(trimmedName, {
      name: trimmedName,
      type: 'file',
      content: text,
      size: text.length,
      created: now,
      parent: this.currentDir
    });
  } else if (mode === 'append') {
    // Ajouter au fichier existant ou créer
    if (existing && existing[1].type === 'file') {
      const newContent = (existing[1].content || '') + '\n' + text;
      existing[1].content = newContent;
      existing[1].size = newContent.length;
      existing[1].created = now;
    } else {
      this.currentDir.children!.set(trimmedName, {
        name: trimmedName,
        type: 'file',
        content: text,
        size: text.length,
        created: now,
        parent: this.currentDir
      });
    }
  }
  
  return true;
}
  private resolvePath(path: string): FileSystemItem | null {
    if (!path || path === '\\' || path === '/') return this.root;
    if (path === '.') return this.currentDir;
    if (path === '..') return this.currentDir.parent || this.root;
    
    if (path.startsWith('C:\\') || path.startsWith('C:/')) {
      const parts = path.substring(3).split(/[\\\/]/).filter(p => p && p.trim() !== '');
      let current = this.root;
      
      for (const part of parts) {
        if (part === '..') {
          current = current.parent || this.root;
        } else if (part !== '.') {
          const children = Array.from(current.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.trim().toLowerCase())?.[1];
          if (!next) return null;
          current = next;
        }
      }
      return current;
    }
    
    const parts = path.split(/[\\\/]/).filter(p => p && p.trim() !== '');
    let current = this.currentDir;
    
    for (const part of parts) {
      if (part === '..') {
        current = current.parent || this.root;
      } else if (part !== '.') {
        const children = Array.from(current.children?.entries() || []);
        const next = children.find(([key]) => key.toLowerCase() === part.trim().toLowerCase())?.[1];
        if (!next) return null;
        current = next;
      }
    }
    return current;
  }
  
  private resolveParentPath(path: string): { parent: FileSystemItem; name: string } | null {
    const parts = path.split(/[\\\/]/).filter(p => p && p.trim() !== '');
    const name = parts.pop()?.trim();
    
    if (!name) return null;
    
    let parent: FileSystemItem;
    
    if (path.startsWith('C:\\') || path.startsWith('C:/')) {
      const parentParts = path.substring(3).split(/[\\\/]/).filter(p => p && p.trim() !== '');
      parentParts.pop();
      parent = this.root;
      
      for (const part of parentParts) {
        if (part === '..') {
          parent = parent.parent || this.root;
        } else if (part !== '.') {
          const children = Array.from(parent.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.trim().toLowerCase())?.[1];
          if (!next) return null;
          parent = next;
        }
      }
    } else {
      const parentParts = parts.slice(0, -1);
      parent = this.currentDir;
      
      for (const part of parentParts) {
        if (part === '..') {
          parent = parent.parent || this.root;
        } else if (part !== '.') {
          const children = Array.from(parent.children?.entries() || []);
          const next = children.find(([key]) => key.toLowerCase() === part.trim().toLowerCase())?.[1];
          if (!next) return null;
          parent = next;
        }
      }
    }
    
    return { parent, name };
  }
  
  getCurrentPath(): string {
    const path: string[] = [];
    let current: FileSystemItem | undefined = this.currentDir;
    
    while (current && current !== this.root) {
      path.unshift(current.name);
      current = current.parent;
    }
    
    return path.length > 0 ? `C:\\${path.join('\\')}` : 'C:\\';
  }
  
  cd(path: string): string {
    if (!path) {
      this.currentDir = this.root;
      return '';
    }
    
    const target = this.resolvePath(path);
    if (!target) {
      throw new Error(`Chemin non trouvé : ${path}`);
    }
    
    if (target.type !== 'dir') {
      throw new Error(`N'est pas un répertoire : ${path}`);
    }
    
    this.currentDir = target;
    return '';
  }
  
  dir(pattern?: string): Array<{ name: string; size: number; date: string; time: string; isDir: boolean }> {
    const items: Array<{ name: string; size: number; date: string; time: string; isDir: boolean }> = [];
    
    const now = this.getDOSDate();
    const [currentDate, currentTime] = now.split(' ');
    
    items.push({
      name: '.',
      size: 0,
      date: currentDate,
      time: currentTime,
      isDir: true
    });
    
    if (this.currentDir.parent) {
      items.push({
        name: '..',
        size: 0,
        date: currentDate,
        time: currentTime,
        isDir: true
      });
    }
    
    if (this.currentDir.children) {
      let entries = Array.from(this.currentDir.children.entries());
      
      if (pattern) {
        const regex = this.patternToRegex(pattern);
        entries = entries.filter(([name]) => regex.test(name));
      }
      
      entries.sort(([aName, aItem], [bName, bItem]) => {
        if (aItem.type === 'dir' && bItem.type !== 'dir') return -1;
        if (aItem.type !== 'dir' && bItem.type === 'dir') return 1;
        return aName.localeCompare(bName);
      });
      
      for (const [name, item] of entries) {
        const [itemDate, itemTime] = item.created.split(' ');
        items.push({
          name: item.name,
          size: item.size,
          date: itemDate || currentDate,
          time: itemTime || currentTime,
          isDir: item.type === 'dir'
        });
      }
    }
    
    return items;
  }
  
  mkdir(paths: string[]): string[] {
    const results: string[] = [];
    
    for (const path of paths) {
      if (!path || path.trim() === '') {
        results.push('La syntaxe de la commande est incorrecte.');
        continue;
      }
      
      const resolved = this.resolveParentPath(path);
      if (!resolved) {
        results.push(`Chemin invalide : ${path}`);
        continue;
      }
      
      const { parent, name } = resolved;
      
      if (!this.validateName(name)) {
        results.push(`Nom de répertoire invalide : "${name}"`);
        continue;
      }
      
      const existing = Array.from(parent.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === name.toLowerCase());
      
      if (existing) {
        results.push(`Le répertoire existe déjà : ${existing[0]}`);
        continue;
      }
      
      parent.children!.set(name, {
        name: name,
        type: 'dir',
        size: 0,
        created: this.getDOSDate(),
        children: new Map(),
        parent: parent
      });
      results.push(`Répertoire créé : ${name}`);
    }
    
    return results;
  }
  
  touch(fileNames: string[]): string[] {
    const results: string[] = [];
    
    for (const fileName of fileNames) {
      if (!fileName || fileName.trim() === '') {
        results.push('La syntaxe de la commande est incorrecte.');
        continue;
      }
      
      const trimmedName = fileName.trim();
      
      if (!this.validateName(trimmedName)) {
        results.push(`Nom de fichier invalide : "${trimmedName}"`);
        continue;
      }
      
      const existing = Array.from(this.currentDir.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === trimmedName.toLowerCase());
      
      if (existing) {
        const item = existing[1];
        item.created = this.getDOSDate();
        results.push(`Horodatage mis à jour : ${existing[0]}`);
      } else {
        this.currentDir.children!.set(trimmedName, {
          name: trimmedName,
          type: 'file',
          content: '',
          size: 0,
          created: this.getDOSDate(),
          parent: this.currentDir
        });
        results.push(`Fichier créé : ${trimmedName}`);
      }
    }
    
    return results;
  }
  
  type(fileName: string): string {
    if (!fileName || fileName.trim() === '') {
      throw new Error('Paramètre requis manquant');
    }
    
    const trimmedName = fileName.trim();
    const existing = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === trimmedName.toLowerCase());
    
    if (!existing) {
      throw new Error(`Fichier non trouvé : ${trimmedName}`);
    }
    
    const file = existing[1];
    
    if (file.type !== 'file') {
      throw new Error(`Accès refusé : ${existing[0]} est un répertoire`);
    }
    
    return file.content || '';
  }
  
  del(fileNames: string[]): { deleted: string[]; errors: string[] } {
    const deleted: string[] = [];
    const errors: string[] = [];
    
    for (const fileName of fileNames) {
      if (!fileName || fileName.trim() === '') {
        errors.push('Paramètre requis manquant');
        continue;
      }
      
      const trimmedName = fileName.trim();
      
      if (trimmedName.includes('*') || trimmedName.includes('?')) {
        const regex = this.patternToRegex(trimmedName);
        const filesToDelete: string[] = [];
        
        if (this.currentDir.children) {
          for (const [name, item] of this.currentDir.children) {
            if (regex.test(name) && item.type === 'file') {
              filesToDelete.push(name);
            }
          }
        }
        
        if (filesToDelete.length === 0) {
          errors.push(`Fichier non trouvé : ${trimmedName}`);
        } else {
          filesToDelete.forEach(file => {
            this.currentDir.children!.delete(file);
            deleted.push(file);
          });
        }
      } else {
        const existing = Array.from(this.currentDir.children?.entries() || [])
          .find(([key]) => key.toLowerCase() === trimmedName.toLowerCase());
        
        if (!existing) {
          errors.push(`Fichier non trouvé : ${trimmedName}`);
          continue;
        }
        
        if (existing[1].type === 'dir') {
          errors.push(`Accès refusé : "${existing[0]}" est un répertoire`);
          continue;
        }
        
        this.currentDir.children!.delete(existing[0]);
        deleted.push(existing[0]);
      }
    }
    
    return { deleted, errors };
  }
  
  rmdir(dirNames: string[]): { removed: string[]; errors: string[] } {
    const removed: string[] = [];
    const errors: string[] = [];
    
    for (const dirName of dirNames) {
      if (!dirName || dirName.trim() === '') {
        errors.push('Paramètre requis manquant');
        continue;
      }
      
      const trimmedName = dirName.trim();
      
      if (trimmedName === '.' || trimmedName === '..') {
        errors.push(`Impossible de supprimer le répertoire "${trimmedName}"`);
        continue;
      }
      
      const existing = Array.from(this.currentDir.children?.entries() || [])
        .find(([key]) => key.toLowerCase() === trimmedName.toLowerCase());
      
      if (!existing) {
        errors.push(`Répertoire non trouvé : ${trimmedName}`);
        continue;
      }
      
      if (existing[1].type !== 'dir') {
        errors.push(`"${existing[0]}" n'est pas un répertoire`);
        continue;
      }
      
      if (existing[1].children && existing[1].children.size > 0) {
        errors.push(`Répertoire non vide : "${existing[0]}"`);
        continue;
      }
      
      this.currentDir.children!.delete(existing[0]);
      removed.push(existing[0]);
    }
    
    return { removed, errors };
  }
  
  rename(oldName: string, newName: string): string {
    if (!oldName || oldName.trim() === '' || !newName || newName.trim() === '') {
      throw new Error('La syntaxe de la commande est incorrecte.');
    }
    
    const trimmedOldName = oldName.trim();
    const trimmedNewName = newName.trim();
    
    if (!this.validateName(trimmedNewName)) {
      throw new Error(`Nom de fichier invalide : "${trimmedNewName}"`);
    }
    
    const existingOld = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === trimmedOldName.toLowerCase());
    
    if (!existingOld) {
      throw new Error(`Fichier non trouvé : ${trimmedOldName}`);
    }
    
    const existingNew = Array.from(this.currentDir.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === trimmedNewName.toLowerCase());
    
    if (existingNew) {
      throw new Error(`Le fichier existe déjà : ${existingNew[0]}`);
    }
    
    const item = existingOld[1];
    item.name = trimmedNewName;
    this.currentDir.children!.set(trimmedNewName, item);
    this.currentDir.children!.delete(existingOld[0]);
    
    return `${existingOld[0]} renommé en ${trimmedNewName}`;
  }
  
  move(source: string, dest: string): string {
    if (!source || source.trim() === '' || !dest || dest.trim() === '') {
      throw new Error('La syntaxe de la commande est incorrecte.');
    }
    
    const trimmedSource = source.trim();
    const trimmedDest = dest.trim();
    
    const sourceItem = this.resolvePath(trimmedSource);
    if (!sourceItem || sourceItem.type === 'dir') {
      throw new Error(`Source non trouvée ou est un répertoire : ${trimmedSource}`);
    }
    
    const destParentPath = this.resolveParentPath(trimmedDest);
    if (!destParentPath) {
      throw new Error(`Destination invalide : ${trimmedDest}`);
    }
    
    const { parent: destParent, name: destName } = destParentPath;
    
    if (!this.validateName(destName)) {
      throw new Error(`Nom de fichier invalide : "${destName}"`);
    }
    
    const existingDest = Array.from(destParent.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === destName.toLowerCase());
    
    if (existingDest) {
      throw new Error(`La destination existe déjà : ${existingDest[0]}`);
    }
    
    destParent.children!.set(destName, {
      ...sourceItem,
      name: destName,
      parent: destParent
    });
    
    const sourceParent = sourceItem.parent || this.currentDir;
    const sourceKey = Array.from(sourceParent.children?.entries() || [])
      .find(([key]) => key.toLowerCase() === sourceItem.name.toLowerCase())?.[0];
    
    if (sourceKey) {
      sourceParent.children!.delete(sourceKey);
    }
    
    return `Déplacé ${sourceItem.name} vers ${destName}`;
  }
copy(source: string, dest: string): string {
  if (!source || source.trim() === '' || !dest || dest.trim() === '') {
    throw new Error('La syntaxe de la commande est incorrecte.');
  }
  
  const trimmedSource = source.trim();
  const trimmedDest = dest.trim();
  
  // 1. Récupérer le fichier source
  const sourceItem = this.resolvePath(trimmedSource);
  if (!sourceItem) {
    throw new Error(`Fichier non trouvé : ${trimmedSource}`);
  }
  
  if (sourceItem.type === 'dir') {
    throw new Error(`La copie de répertoires n'est pas supportée : ${trimmedSource}`);
  }
  
  // 2. Analyser la destination
  let destParent: FileSystemItem;
  let destName: string;
  
  // Vérifier si la destination est un répertoire existant
  const destAsDir = this.resolvePath(trimmedDest);
  if (destAsDir && destAsDir.type === 'dir') {
    // Si la destination est un répertoire, copier avec le même nom
    destParent = destAsDir;
    destName = sourceItem.name;
  } else {
    // Sinon, analyser comme un chemin de fichier
    const destParentPath = this.resolveParentPath(trimmedDest);
    if (!destParentPath) {
      throw new Error(`Chemin de destination invalide : ${trimmedDest}`);
    }
    
    destParent = destParentPath.parent;
    destName = destParentPath.name;
  }
  
  // 3. Vérifier si le nom est valide
  if (!this.validateName(destName)) {
    throw new Error(`Nom de fichier invalide : "${destName}"`);
  }
  
  // 4. Vérifier si le fichier de destination existe déjà
  // Recherche insensible à la casse
  const existingDest = Array.from(destParent.children?.entries() || [])
    .find(([key]) => key.toLowerCase() === destName.toLowerCase());
  
  if (existingDest) {
    // DOS permet généralement d'écraser sans demander
    // Pour simuler DOS, on écrase silencieusement
    // Ou vous pouvez ajouter une option /Y pour forcer l'écrasement
    destParent.children!.delete(existingDest[0]);
  }
  
  // 5. Créer la copie
  const now = this.getDOSDate();
  destParent.children!.set(destName, {
    ...JSON.parse(JSON.stringify(sourceItem)),
    name: destName,
    parent: destParent,
    created: now
  });
  
  return `Copié ${sourceItem.name} vers ${destName}`;
}
  tree(): string[] {
    const lines: string[] = [];
    
    const buildTree = (dir: FileSystemItem, prefix: string = '', isLast: boolean = true) => {
      const children = Array.from(dir.children?.entries() || [])
        .filter(([name, item]) => item.type === 'dir' && name !== '.' && name !== '..')
        .sort(([aName], [bName]) => aName.localeCompare(bName));
      
      for (let i = 0; i < children.length; i++) {
        const [name, item] = children[i];
        const isChildLast = i === children.length - 1;
        const connector = isLast ? '└──' : '├──';
        
        lines.push(`${prefix}${connector} ${name}`);
        
        if (item.children && item.children.size > 0) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          buildTree(item, newPrefix, isChildLast);
        }
      }
      
      const files = Array.from(dir.children?.entries() || [])
        .filter(([name, item]) => item.type === 'file' && name !== '.' && name !== '..')
        .sort(([aName], [bName]) => aName.localeCompare(bName));
      
      for (let i = 0; i < files.length; i++) {
        const [name] = files[i];
        const isFileLast = i === files.length - 1 && children.length === 0;
        const connector = isLast ? '└──' : '├──';
        const filePrefix = children.length === 0 ? '' : (isLast ? '    ' : '│   ');
        
        lines.push(`${prefix}${filePrefix}${connector} ${name}`);
      }
    };
    
    lines.push(`Arborescence des dossiers pour le volume ${this.root.name}`);
    lines.push(`Numéro de série du volume: 1234-ABCD`);
    lines.push(`${this.getCurrentPath()}`);
    buildTree(this.currentDir);
    
    let dirCount = 0;
    let fileCount = 0;
    
    const countItems = (dir: FileSystemItem) => {
      const children = Array.from(dir.children?.entries() || [])
        .filter(([name]) => name !== '.' && name !== '..');
      
      for (const [name, item] of children) {
        if (item.type === 'dir') {
          dirCount++;
          if (item.children) {
            countItems(item);
          }
        } else {
          fileCount++;
        }
      }
    };
    
    countItems(this.currentDir);
    lines.push('');
    lines.push(`    ${dirCount} Répertoire(s)`);
    lines.push(`    ${fileCount} Fichier(s)`);
    
    return lines;
  }
}

export const fileSystem = new VirtualFileSystem();