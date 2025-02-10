import ckan.plugins as plugins
import ckan.plugins.toolkit as toolkit
from ckan.lib.plugins import DefaultTranslation
from ckanext.afucn.subresource import create_subresource
from ckan.common import config

subresource = config.get('ckanext.afucn.subresource', False)


class AfucnPlugin(plugins.SingletonPlugin, DefaultTranslation):
    plugins.implements(plugins.IConfigurer)
    plugins.implements(plugins.IFacets)
    plugins.implements(plugins.ITranslation)
    plugins.implements(plugins.IResourceController, inherit=True)
    
    # IConfigurer

    def update_config(self, config_):
        toolkit.add_template_directory(config_, "templates")
        toolkit.add_public_directory(config_, "public")
        toolkit.add_resource("assets", "afucn")

    # IFacets

    def dataset_facets(self, facets_dict, package_type):
        '''Add new search facet (filter) for datasets.
        This must be a field in the dataset (or organization or
        group if you're modifying those search facets, just change the function).
        '''
        # This keeps the existing facet order.
        facets_dict['country'] = plugins.toolkit._('Country')
        facets_dict['organization'] = plugins.toolkit._('Organization')
        facets_dict['groups'] = plugins.toolkit._('Groups')
        facets_dict['tags'] = plugins.toolkit._('tags')
        facets_dict['res_format'] = plugins.toolkit._('Format')
        facets_dict['license_id'] = plugins.toolkit._('License')

        return facets_dict

    def group_facets(self, facets_dict, group_type, package_type):

        # This keeps the existing facet order.
        facets_dict['country'] = plugins.toolkit._('Country')
        facets_dict['organization'] = plugins.toolkit._('Organization')
        facets_dict['groups'] = plugins.toolkit._('Groups')
        facets_dict['tags'] = plugins.toolkit._('tags')
        facets_dict['res_format'] = plugins.toolkit._('Format')
        facets_dict['license_id'] = plugins.toolkit._('License')
        
        return facets_dict
    
    def organization_facets(self, facets_dict, organization_type, package_type):

        # This keeps the existing facet order.
        facets_dict['country'] = plugins.toolkit._('Country')
        facets_dict['organization'] = plugins.toolkit._('Organization')
        facets_dict['groups'] = plugins.toolkit._('Groups')
        facets_dict['tags'] = plugins.toolkit._('tags')
        facets_dict['res_format'] = plugins.toolkit._('Format')
        facets_dict['license_id'] = plugins.toolkit._('License')
        
        return facets_dict
    
    # IResourceController

    def after_resource_create(self, context, resource_dict):
        if subresource:
            create_subresource(context, resource_dict)
        return
