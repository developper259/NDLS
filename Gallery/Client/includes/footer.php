<?php
/**
 * Footer - Galerie Photos
 * Inclure ce fichier à la fin de chaque page
 */
?>
        <!-- Footer -->
        <footer class="footer">
            <div class="footer-content">
                <div class="footer-links">
                    <span>&copy; <?php echo date('Y'); ?> Memories</span>
                    <span>•</span>
                    <a href="#">Confidentialité</a>
                    <a href="#">Conditions</a>
                </div>
                <div>
                    <span style="font-size: 12px;">Interface NDLS Gallery</span>
                </div>
            </div>
        </footer>
        
        <!-- Lightbox -->
        <div class="lightbox" id="lightbox"></div>
        
        <!-- Toast Container -->
        <div class="toast-container" id="toast-container"></div>
        
    </div><!-- /.app-container -->

    <!-- Scripts -->
    <script src="assets/js/config.js"></script>
    <script src="assets/js/api.js"></script>
    <script src="assets/js/app.js"></script>
    <script src="assets/js/context-menu.js"></script>
    <script>
      // Initialiser le menu contextuel global
      window.contextMenu = new ContextMenu();
      console.log('Menu contextuel initialisé');
    </script>
</body>
</html>
