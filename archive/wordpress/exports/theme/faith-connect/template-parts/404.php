<?php
/**
 * The template for displaying 404 pages (not found).
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly
}
?>
<div class="cmsmasters-error-page">
	<header class="cmsmasters-error-page__header">
		<h1 class="cmsmasters-error-page__title"><?php esc_html_e( '404', 'faith-connect' ); ?></h1>
	</header>
	<div class="cmsmasters-error-page__content">
		<p><?php esc_html_e( "We're sorry, but the page you were looking for doesn't exist", 'faith-connect' ); ?></p>
		<?php get_search_form(); ?>
	</div>
</div>
