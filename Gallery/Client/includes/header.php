<?php
/**
 * Header - Galerie Photos
 * Inclure ce fichier au début de chaque page
 */
?>
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>NDLS - Gallery</title>
    
    <!-- Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
    
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="stylesheet" href="assets/css/context-menu.css">
    
    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><rect fill='%232563eb' rx='20' width='100' height='100'/><text x='50' y='65' font-size='50' fill='white' text-anchor='middle' font-family='sans-serif' font-weight='bold'>N</text></svg>">
</head>
<body>
    <div class="app-container">
        <!-- Header -->
        <header class="header">
            <div class="header-left">
                <!-- Mobile menu toggle -->
                <button class="sidebar-toggle" id="sidebar-toggle">
                    <span class="material-icons">menu</span>
                </button>
                
                <!-- Logo -->
                <a href="index.php" class="logo">
                    <div class="logo-icon">N</div>
                    <span class="logo-text">Gallery</span>
                </a>
            </div>
            
            <div class="header-center">
                <div class="search-box">
                    <span class="material-icons">search</span>
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Rechercher dans vos photos..."
                    >
                </div>
            </div>
            
            <div class="header-right">
                <!-- Bouton plus avec menu déroulant -->
                <div class="dropdown-container">
                    <button class="btn-plus" id="btn-plus">
                        <span class="material-icons">add</span>
                    </button>
                    
                    <div class="dropdown-menu" id="dropdown-menu">
                        <button class="dropdown-item" id="import-file">
                            <span class="material-icons">upload</span>
                            Importer un fichier
                        </button>
                        <button class="dropdown-item" id="create-album">
                            <span class="material-icons">create_new_folder</span>
                            Créer un album
                        </button>
                    </div>
                </div>
                
                <button class="user-avatar">U</button>
            </div>
        </header>
