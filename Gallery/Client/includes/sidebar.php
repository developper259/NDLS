<?php
/**
 * Sidebar - Galerie Photos
 * Sidebar avec upload, filtres et stockage
 */
?>
<!-- Sidebar Overlay (mobile) -->
<div class="sidebar-overlay" id="sidebar-overlay"></div>

<!-- Sidebar -->
<aside class="sidebar" id="sidebar">
    <!-- Upload Button -->
    <div class="sidebar-header">
        <button class="upload-btn" id="upload-btn">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
            <span>Importer</span>
        </button>
        <input 
            type="file" 
            id="file-input" 
            accept="image/*,video/*" 
            multiple 
            style="display: none;"
        >
    </div>
    
    <!-- Navigation -->
    <div class="sidebar-content">
        <!-- Bouton Photos -->
        <button class="nav-btn active" id="nav-photos">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21 15 16 10 5 21"></polyline>
            </svg>
            <span>Photos</span>
        </button>
        
        <!-- Bouton Albums -->
        <button class="nav-btn" id="nav-albums">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" rx="1"></rect>
                <rect x="3" y="14" width="7" height="7" rx="1"></rect>
                <rect x="14" y="3" width="7" height="7" rx="1"></rect>
                <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
            <span>Albums</span>
        </button>
        
        <!-- Bouton Favoris -->
        <button class="nav-btn" id="nav-favorites">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
            </svg>
            <span>Favoris</span>
        </button>
        
        <!-- Bouton Corbeille -->
        <button class="nav-btn" id="nav-trash">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                <line x1="10" y1="11" x2="10" y2="17"></line>
                <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
            <span>Corbeille</span>
        </button>
    </div>
    
    <!-- Storage -->
    <div class="sidebar-footer" id="storage-section">
        <!-- Rendered by JS -->
    </div>
</aside>
