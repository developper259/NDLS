<?php
/**
 * Page principale - Galerie Photos
 * Interface style Google Photos
 */

// Inclure le header
include 'includes/header.php';

// Inclure la sidebar
include 'includes/sidebar.php';
?>

        <!-- Main Content -->
        <main class="main-layout">
            <div class="main-content" id="gallery-container">
                <!-- Stats Header -->
                <div class="gallery-header">
                    <div class="media-stats" id="media-stats">
                        <!-- Rendered by JS -->
                    </div>
                </div>
                
                <!-- Album Title -->
                <div class="album-title-container" id="album-title-container" style="display: none;">
                    <div class="album-title-content">
                        <button class="back-to-albums" id="back-to-albums">
                            <span class="material-icons">arrow_back</span>
                            <span>Retour aux albums</span>
                        </button>
                        <h2 class="album-title" id="album-title"></h2>
                    </div>
                </div>
                
                <!-- Photo Grid -->
                <div class="photo-grid" id="photo-grid">
                    <!-- Rendered by JS -->
                </div>
            </div>
        </main>

<?php
// Inclure le footer
include 'includes/footer.php';
?>
