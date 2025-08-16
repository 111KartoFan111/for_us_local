// backend/src/services/database.js - ИСПРАВЛЕННАЯ ВЕРСИЯ
import { Low } from 'lowdb';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Custom JSON File adapter for LowDB v3 + ES modules
class JSONFileAdapter {
  constructor(filename) {
    this.filename = filename;
  }
  
  async read() {
    try {
      const data = await fs.readFile(this.filename, 'utf8');
      
      // ✅ ИСПРАВЛЕНИЕ: Проверяем, что файл не пустой
      if (!data || data.trim() === '') {
        console.log('📄 Database file is empty, returning null for initialization');
        return null;
      }
      
      // ✅ ИСПРАВЛЕНИЕ: Дополнительная проверка JSON
      try {
        return JSON.parse(data);
      } catch (parseError) {
        console.error('❌ JSON parse error in database file:', parseError.message);
        console.log('📝 File content preview:', data.substring(0, 100));
        
        // Создаем backup поврежденного файла
        const backupPath = `${this.filename}.corrupted.${Date.now()}`;
        await fs.writeFile(backupPath, data);
        console.log(`💾 Corrupted file backed up to: ${backupPath}`);
        
        return null; // Вернуть null для пересоздания базы
      }
      
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('📄 Database file doesn\'t exist, will be created');
        return null; // File doesn't exist
      }
      throw error;
    }
  }
  
  async write(data) {
    const dir = path.dirname(this.filename);
    await fs.mkdir(dir, { recursive: true });
    
    // ✅ ИСПРАВЛЕНИЕ: Более безопасная запись JSON
    try {
      const jsonString = JSON.stringify(data, null, 2);
      await fs.writeFile(this.filename, jsonString, 'utf8');
      console.log('💾 Database successfully written to disk');
    } catch (writeError) {
      console.error('❌ Error writing database:', writeError);
      throw writeError;
    }
  }
}

// Database file path
const DB_PATH = path.join(__dirname, '../../data/db.json');

// Default database structure
const defaultData = {
  users: [],
  projects: [],
  settings: {
    studio: {
      aboutText: "Welcome to our creative studio. We craft exceptional digital experiences that blend innovation with artistic vision.",
      clients: [
        "Google",
        "Apple", 
        "Microsoft",
        "Adobe",
        "Spotify"
      ],
      services: [
        "Web Development",
        "3D Visualization", 
        "UI/UX Design",
        "Brand Identity",
        "Digital Strategy"
      ],
      recognitions: [
        "Awwwards Site of the Day 2024",
        "CSS Design Awards Winner",
        "FWA of the Month"
      ]
    },
    contact: {
      contactButtons: [
        {
          text: "Email",
          url: "mailto:contact@example.com"
        },
        {
          text: "LinkedIn", 
          url: "https://linkedin.com/company/example"
        }
      ]
    }
  }
};

let db = null;

/**
 * ✅ МИГРАЦИЯ: Добавляет releaseDate к существующим проектам
 */
async function migrateDatabase() {
  if (!db || !db.data || !db.data.projects) return;
  
  console.log('🔄 Checking for database migrations...');
  
  let needsMigration = false;
  
  // Проверяем каждый проект на наличие releaseDate
  db.data.projects.forEach((project, index) => {
    if (!project.releaseDate) {
      needsMigration = true;
      
      // Используем createdAt как fallback для releaseDate
      const fallbackDate = project.createdAt || new Date().toISOString();
      db.data.projects[index].releaseDate = fallbackDate;
      
      console.log(`✅ Migrated project "${project.title}" - added releaseDate: ${fallbackDate}`);
    }
  });
  
  if (needsMigration) {
    await db.write();
    console.log('✅ Database migration completed - releaseDate field added to projects');
  } else {
    console.log('✅ No migration needed - all projects have releaseDate field');
  }
}

/**
 * ✅ ИСПРАВЛЕННАЯ функция инициализации базы данных
 */
async function initializeDatabase() {
  try {
    console.log('🚀 Initializing database...');
    
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    console.log('✅ Data directory ensured');
    
    // ✅ ИСПРАВЛЕНИЕ: Проверяем существование файла базы данных
    let fileExists = false;
    try {
      await fs.access(DB_PATH);
      fileExists = true;
      console.log('📄 Database file exists');
    } catch {
      console.log('📄 Database file does not exist, will create new');
    }
    
    // ✅ ИСПРАВЛЕНИЕ: Проверяем содержимое файла если он существует
    if (fileExists) {
      try {
        const fileContent = await fs.readFile(DB_PATH, 'utf8');
        if (!fileContent || fileContent.trim() === '') {
          console.log('📄 Database file is empty, removing...');
          await fs.unlink(DB_PATH);
          fileExists = false;
        } else {
          // Проверяем валидность JSON
          try {
            JSON.parse(fileContent);
            console.log('✅ Database file is valid JSON');
          } catch (parseError) {
            console.log('❌ Database file contains invalid JSON, recreating...');
            const backupPath = `${DB_PATH}.backup.${Date.now()}`;
            await fs.rename(DB_PATH, backupPath);
            console.log(`💾 Invalid database backed up to: ${backupPath}`);
            fileExists = false;
          }
        }
      } catch (readError) {
        console.error('❌ Error reading database file:', readError.message);
        fileExists = false;
      }
    }
    
    // Initialize LowDB with custom adapter
    const adapter = new JSONFileAdapter(DB_PATH);
    db = new Low(adapter, defaultData);
    
    // Read the database
    console.log('📖 Reading database...');
    await db.read();
    console.log('✅ Database file read successfully');
    
    // If database is empty or null, set default data
    if (!db.data) {
      console.log('📝 Setting default database structure...');
      db.data = { ...defaultData };
      await db.write();
      console.log('✅ Default data written to database');
    }
    
    // Ensure all collections exist
    if (!db.data.users) {
      db.data.users = [];
      console.log('✅ Users collection initialized');
    }
    if (!db.data.projects) {
      db.data.projects = [];
      console.log('✅ Projects collection initialized');
    }
    if (!db.data.settings) {
      db.data.settings = defaultData.settings;
      console.log('✅ Settings collection initialized');
    }
    
    // Ensure studio field exists
    if (!db.data.settings.studio) {
      db.data.settings.studio = defaultData.settings.studio;
      console.log('✅ Studio settings initialized');
    }
    
    // Ensure contact field exists
    if (!db.data.settings.contact) {
      db.data.settings.contact = defaultData.settings.contact;
      console.log('✅ Contact settings initialized');
    }
    
    // ✅ ВЫПОЛНЯЕМ МИГРАЦИЮ
    await migrateDatabase();
    
    // Create default admin user if doesn't exist
    await createDefaultAdmin();
    
    // Write to file to ensure everything is saved
    await db.write();
    
    console.log('✅ Database initialized successfully');
    console.log(`📊 Current state: Users: ${db.data.users.length}, Projects: ${db.data.projects.length}`);
    
    return db;
    
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    
    // ✅ ИСПРАВЛЕНИЕ: В случае критической ошибки, пересоздаем базу
    if (error.message.includes('JSON') || error.message.includes('parse')) {
      console.log('🔄 Attempting to recreate database due to JSON error...');
      
      try {
        // Удаляем поврежденный файл
        await fs.unlink(DB_PATH).catch(() => {});
        
        // Пересоздаем базу
        const adapter = new JSONFileAdapter(DB_PATH);
        db = new Low(adapter, defaultData);
        db.data = { ...defaultData };
        await db.write();
        
        // Создаем админа
        await createDefaultAdmin();
        await db.write();
        
        console.log('✅ Database recreated successfully');
        return db;
        
      } catch (recreateError) {
        console.error('❌ Failed to recreate database:', recreateError);
        throw recreateError;
      }
    }
    
    throw error;
  }
}

/**
 * Create default admin user
 */
async function createDefaultAdmin() {
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
  
  // Check if admin user already exists
  const existingAdmin = db.data.users.find(user => user.username === adminUsername);
  
  if (!existingAdmin) {
    console.log('👤 Creating default admin user...');
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    const adminUser = {
      id: 1,
      username: adminUsername,
      password: hashedPassword,
      role: 'admin',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.data.users.push(adminUser);
    console.log(`✅ Default admin user created: ${adminUsername}`);
    console.log(`🔑 Password: ${adminPassword}`);
  } else {
    console.log(`👤 Admin user already exists: ${adminUsername}`);
  }
}

/**
 * Get database instance
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call initializeDatabase() first.');
  }
  return db;
}

/**
 * Get all users
 */
function getUsers() {
  return getDatabase().data.users;
}

/**
 * Get user by ID
 */
function getUserById(id) {
  return getUsers().find(user => user.id === parseInt(id));
}

/**
 * Get user by username
 */
function getUserByUsername(username) {
  return getUsers().find(user => user.username === username);
}

/**
 * Get all projects
 */
function getProjects() {
  return getDatabase().data.projects;
}

/**
 * Get project by ID
 */
function getProjectById(id) {
  return getProjects().find(project => project.id === parseInt(id));
}

/**
 * Add new project
 */
async function addProject(projectData) {
  const projects = getProjects();
  const newId = projects.length > 0 ? Math.max(...projects.map(p => p.id)) + 1 : 1;
  
  const newProject = {
    id: newId,
    ...projectData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // ✅ Убеждаемся что releaseDate есть
  if (!newProject.releaseDate) {
    newProject.releaseDate = newProject.createdAt;
  }
  
  projects.push(newProject);
  await getDatabase().write();
  
  return newProject;
}

/**
 * Update project
 */
async function updateProject(id, updateData) {
  const projects = getProjects();
  const projectIndex = projects.findIndex(project => project.id === parseInt(id));
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  projects[projectIndex] = {
    ...projects[projectIndex],
    ...updateData,
    updatedAt: new Date().toISOString()
  };
  
  // ✅ Убеждаемся что releaseDate есть при обновлении
  if (!projects[projectIndex].releaseDate && projects[projectIndex].createdAt) {
    projects[projectIndex].releaseDate = projects[projectIndex].createdAt;
  }
  
  await getDatabase().write();
  return projects[projectIndex];
}

/**
 * Delete project
 */
async function deleteProject(id) {
  const db = getDatabase();
  const projects = db.data.projects;
  const projectIndex = projects.findIndex(project => project.id === parseInt(id));
  
  if (projectIndex === -1) {
    throw new Error('Project not found');
  }
  
  const deletedProject = projects.splice(projectIndex, 1)[0];
  await db.write();
  
  return deletedProject;
}

/**
 * Get settings
 */
function getSettings() {
  const settings = getDatabase().data.settings;
  
  // Ensure studio field exists
  if (!settings.studio) {
    settings.studio = defaultData.settings.studio;
  }
  
  // Ensure contact field exists
  if (!settings.contact) {
    settings.contact = defaultData.settings.contact;
  }
  
  return settings;
}

/**
 * Update settings
 */
async function updateSettings(newSettings) {
  const db = getDatabase();
  db.data.settings = { ...db.data.settings, ...newSettings };
  await db.write();
  return db.data.settings;
}

export {
  initializeDatabase,
  getDatabase,
  getUsers,
  getUserById,
  getUserByUsername,
  getProjects,
  getProjectById,
  addProject,
  updateProject,
  deleteProject,
  getSettings,
  updateSettings
};