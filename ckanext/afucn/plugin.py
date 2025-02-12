import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.lib.plugins import DefaultTranslation

# --------------------------------------------------------------------
# Original Plugin Class
# --------------------------------------------------------------------
class AfucnPlugin(plugins.SingletonPlugin, DefaultTranslation):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITranslation)

    # IConfigurer
    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "afucn")

    # IFacets
    def dataset_facets(self, facets_dict, package_type):
        facets_dict['country'] = toolkit._('Country')
        facets_dict['organization'] = toolkit._('Organization')
        facets_dict['groups'] = toolkit._('Groups')
        facets_dict['tags'] = toolkit._('tags')
        facets_dict['res_format'] = toolkit._('Format')
        facets_dict['license_id'] = toolkit._('License')
        return facets_dict

    def group_facets(self, facets_dict, group_type, package_type):
        facets_dict['country'] = toolkit._('Country')
        facets_dict['organization'] = toolkit._('Organization')
        facets_dict['groups'] = toolkit._('Groups')
        facets_dict['tags'] = toolkit._('tags')
        facets_dict['res_format'] = toolkit._('Format')
        facets_dict['license_id'] = toolkit._('License')
        return facets_dict

    def organization_facets(self, facets_dict, organization_type, package_type):
        facets_dict['country'] = toolkit._('Country')
        facets_dict['organization'] = toolkit._('Organization')
        facets_dict['groups'] = toolkit._('Groups')
        facets_dict['tags'] = toolkit._('tags')
        facets_dict['res_format'] = toolkit._('Format')
        facets_dict['license_id'] = toolkit._('License')
        return facets_dict

# --------------------------------------------------------------------
# New Resource View: Portal Map
# --------------------------------------------------------------------
class PortalMapView(plugins.SingletonPlugin, DefaultTranslation):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "afucn")

    def info(self):
        return {
            'name': 'portal_map',
            'title': 'Portal Map',
            'icon': 'map',
            'iframed': False,
            'default_title': 'Portal Map',
            'always_available': True,
            'preview_enabled': True,
            'full_page_edit': False,
        }

    def can_view(self, data_dict):
        resource = data_dict.get('resource')
        fmt = resource.get('format', '').lower()
        return fmt in ['csv', 'xls', 'xlsx']

    def view_template(self, context, data_dict):
        return 'views/portal_map.html'

    def view_config(self, context, data_dict):
        return {}

    def order(self):
        return 2


# --------------------------------------------------------------------
# New Resource View: Portal Chart
# --------------------------------------------------------------------
class PortalChartView(plugins.SingletonPlugin, DefaultTranslation):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IResourceView, inherit=True)

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "afucn")

    def info(self):
        return {
            'name': 'portal_chart',
            'title': 'Portal Chart',
            'icon': 'chart-pie',
            'iframed': False,
            'default_title': 'Portal Chart',
            'always_available': True,
            'preview_enabled': True,
            'full_page_edit': False,
        }

    def can_view(self, data_dict):
        resource = data_dict.get('resource')
        fmt = resource.get('format', '').lower()
        return fmt in ['csv', 'xls', 'xlsx']

    def view_template(self, context, data_dict):
        return 'views/portal_chart.html'

    def view_config(self, context, data_dict):
        return {}

    def order(self):
        return 3