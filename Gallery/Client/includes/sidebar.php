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
    
    <!-- Filters -->
    <div class="sidebar-content">
        <div class="filters-header" id="toggle-filters">
            <h3>
                <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
                </svg>
                Filtres
            </h3>
            <svg class="chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </div>
        
        <div class="filters-content" id="filters-content">
            <!-- Type Filter -->
            <div class="filter-group">
                <label class="filter-label">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                        <circle cx="8.5" cy="8.5" r="1.5"></circle>
                        <polyline points="21 15 16 10 5 21"></polyline>
                    </svg>
                    Type
                </label>
                <select class="filter-select" id="filter-type">
                    <option value="all">Tous les médias</option>
                    <option value="photo">Photos uniquement</option>
                    <option value="video">Vidéos uniquement</option>
                </select>
            </div>
            
            <!-- Size Filter -->
            <div class="filter-group">
                <label class="filter-label">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
                        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
                        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
                    </svg>
                    Taille
                </label>
                <select class="filter-select" id="filter-size">
                    <option value="all">Toutes tailles</option>
                    <option value="small">Petit (&lt; 2 MB)</option>
                    <option value="medium">Moyen (2-10 MB)</option>
                    <option value="large">Grand (&gt; 10 MB)</option>
                </select>
            </div>
            
            <!-- Sort Filter -->
            <div class="filter-group">
                <label class="filter-label">
                    <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="12" y1="5" x2="12" y2="19"></line>
                        <polyline points="19 12 12 19 5 12"></polyline>
                    </svg>
                    Trier par
                </label>
                <select class="filter-select" id="filter-sort">
                    <option value="date_desc">Plus récent</option>
                    <option value="date_asc">Plus ancien</option>
                    <option value="size_desc">Plus grand</option>
                    <option value="size_asc">Plus petit</option>
                    <option value="name_asc">Nom (A-Z)</option>
                    <option value="name_desc">Nom (Z-A)</option>
                </select>
            </div>
        </div>
    </div>
    
    <!-- Storage -->
    <div class="sidebar-footer" id="storage-section">
        <!-- Rendered by JS -->
    </div>
</aside>
