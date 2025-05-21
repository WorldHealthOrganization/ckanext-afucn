
import logging
from ckantoolkit import h
from ckan.plugins import toolkit as tk

all_helpers = {}

log = logging.getLogger(__name__)


def helper(fn):
    """
    collect helper functions into ckanext.scheming.all_helpers dict
    """
    all_helpers[fn.__name__] = fn
    return fn


@helper
def get_labeler_for_facet(facet, schema_type='dataset'):
    """
    
    :param schema_type: type of scheming schema to use, defaults to 'dataset'
    :param facet: the facet requiring a labeler  
    :return: a labeler function for scheming files or None if no field was not a scheming field or a choices field
    """
    log.info(h.scheming_get_dataset_schema('dataset'))
    scheming_field = h.scheming_field_by_name(h.scheming_get_dataset_schema(schema_type)['dataset_fields'], facet)

    # Not a scheming field don't create a labeler and use the default
    if scheming_field is None:
        return None

    choices = h.scheming_field_choices(scheming_field)

    # Not a choices field, don't create a labeler and use the default
    if choices is None:
        return None

    def get_label_for_field(field):
        return h.scheming_choices_label(choices, field['name'])

    return get_label_for_field


def get_google_tag():
    gtag = tk.config.get('ckanext.afucn.gtag')
    return gtag
