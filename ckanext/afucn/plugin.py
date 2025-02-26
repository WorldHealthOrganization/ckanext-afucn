import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
import json
from typing import Dict
from ckan.lib.plugins import DefaultTranslation
from ckanext.afucn.subresource import create_subresource
from ckan.common import config

subresource = config.get('ckanext.afucn.subresource', False)

# --------------------------------------------------------------------
# Original Plugin Class
# --------------------------------------------------------------------
class AfucnPlugin(plugins.SingletonPlugin, DefaultTranslation):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITranslation)
    plugins.implements(plugins.IResourceController, inherit=True)
    plugins.implements(plugins.IPackageController, inherit=True)

    # IConfigurer

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
    
    # IResourceController
    
    def after_resource_create(self, context, resource_dict):
        if subresource:
            create_subresource(context, resource_dict)
        return
    
    # IPackageController

    def before_dataset_index(self, data_dict: Dict) -> Dict:
        """Load custom multivalued fields as objects before solr indexing.

        Args:
            data_dict (Dict): input data

        Returns:
            Dict: Normalized input data
        """
        if isinstance(data_dict.get('programme'), str):
            data_dict['programme'] = json.loads(data_dict['programme'])
        if isinstance(data_dict.get('country'), str):
            data_dict['country'] = json.loads(data_dict['country'])

        return data_dict

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
    
    
