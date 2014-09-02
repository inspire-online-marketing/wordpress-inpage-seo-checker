<?php

/*
 Plugin Name: Inpage SEO Checker
 Plugin URI:
 Description: Do a quick and simple SEO check per page on the frontend of your blog
 Author: Gijs kooij
 Version: 1.0
 Author URI: http://www.inspiremarketing.nl/
 */



class InpageSEOChecker {

    // hook all plugin action and filter
    function __construct() {
        // Initialize setting options on activation
        register_activation_hook(__FILE__, array($this, 'wisc_settings_default_values'));

        // register Menu
        add_action('admin_menu', array($this, 'wisc_settings_menu'));

        // hook plugin section and field to admin_init
        add_action('admin_init', array($this, 'pluginOption'));

        // add the plugin stylesheet to header
        add_action('wp_head', array($this, 'stylesheet'));

    }

    public function wisc_settings_default_values() {
        $wisc_plugin_options = array(
            'activate' => 1,
            'adminonly' => 1
        );
        update_option('inpage_seo_checker', $wisc_plugin_options);
    }

    // get option value from the database
    public function databaseValues() {
        $options = get_option('inpage_seo_checker');
        $this->_activate = $options['activate'];
        $this->_adminonly = $options['adminonly'];
    }

    // Adding Submenu to settings
    public function wisc_settings_menu() {
        add_options_page('Inpage SEO Checker',
            'Inpage SEO Checker',
            'manage_options',
            'inpage_seo_checker',
            array($this, 'inpage_seo_checker_function')
        );
    }

    // setttings form
    public function inpage_seo_checker_function() {
        echo '<div class="wrap">';
        screen_icon();
        echo '<h2>Inpage SEO Checker</h2>';
        echo '<form action="options.php" method="post">';
        do_settings_sections('inpage_seo_checker');
        settings_fields('wisc_settings_group');
        submit_button();

    }

    // plugin field and sections
    public function pluginOption() {
        add_settings_section('wisc_settings_section',
            'Plugin Options',
            null,
            'inpage_seo_checker'
        );

        add_settings_field('activate',
            '<label for="activate">Active</label>',
            array($this, 'wisc_activate'),
            'inpage_seo_checker',
            'wisc_settings_section'
        );

        add_settings_field('adminonly',
            '<label for="years">Only show for admins</label>',
            array($this, 'wisc_adminonly'),
            'inpage_seo_checker',
            'wisc_settings_section'
        );

        // register settings
        register_setting('wisc_settings_group', 'inpage_seo_checker');
    }

    // ------------------------------------------------------------------
    // Settings section callback function
    // ------------------------------------------------------------------

    public function wisc_activate() {
        // call database values just like global in procedural
        $this->databaseValues();
        echo '<input type="checkbox" id="activate" name="inpage_seo_checker[activate]" value="1" '.checked( 1, $this->_activate, false ).' />';
    }

    public function wisc_adminonly() {
        // call database values
        $this->databaseValues();
        echo '<input type="checkbox" id="adminonly" name="inpage_seo_checker[adminonly]" value="1" '.checked( 1, $this->_adminonly, false ).' />';

    }

    // ------------------------------------------------------------------
    // Plugin functions
    // ------------------------------------------------------------------

    // plugin Stylesheet
    public function stylesheet() {

        $is_admin = current_user_can( 'manage_options' );
        $this->databaseValues();


        if(!$this->_activate){
            return false;
        }

        if($this->_adminonly and !$is_admin){
            return false;
        }

        $pluginfile =  plugins_url( '/seochecker.js', __FILE__ );


        echo <<<HTML
		<!-- Inpage SEO checker (author: http://www.inspiremarketing.nl) -->
	    <style type="text/css"></style>

	    <script>
	    var _seo = { 'em_check': false };
        (function() {
          var seo = document.createElement('script'); seo.type = 'text/javascript'; seo.async = true;
          seo.src = '$pluginfile';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(seo, s);
        })();
	    </script>
	    <!-- // end Inpage SEO checker -->

HTML;

    }

}

// instantiate the class
new InpageSEOChecker;
