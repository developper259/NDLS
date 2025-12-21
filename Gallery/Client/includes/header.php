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
    
    <!-- Styles -->
    <link rel="stylesheet" href="assets/css/style.css">
    
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
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="3" y1="12" x2="21" y2="12"></line>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <line x1="3" y1="18" x2="21" y2="18"></line>
                    </svg>
                </button>
                
                <!-- Logo -->
                <a href="index.php" class="logo">
                    <div class="logo-icon">N</div>
                    <span class="logo-text">Gallery</span>
                </a>
            </div>
            
            <div class="header-center">
                <div class="search-box">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                    </svg>
                    <input 
                        type="text" 
                        id="search-input" 
                        class="search-input" 
                        placeholder="Rechercher dans vos photos..."
                    >
                </div>
            </div>
            
            <div class="header-right">
                <button class="user-avatar">U</button>
            </div>
        </header>
