import ckan.plugins.toolkit as tk
from ckan.common import g


def create_subresource(context, resource_dict):

    local_file_path = '/home/blagoja/Downloads/sample_data/sample.txt'
    
    with open(local_file_path, 'rb') as file_content:
        data_dict = {
            'package_id': resource_dict['package_id'],
            'name': 'Subresource',
            'upload': file_content,
        }

    # x = tk.get_action("resource_create")(context, data_dict)

    print("======================================================================")
    print(g.user)
    print("======================================================================")
    return 
