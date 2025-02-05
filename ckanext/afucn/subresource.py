import ckan.plugins.toolkit as tk
from ckan.common import config
import os
import logging
from pathlib import Path
from shutil import copyfile

log = logging.getLogger(__name__)

try:
    storage_path = config.get('ckan.storage_path')
except:
    log.critical('''Please specify a ckan.storage_path in your config
                         for your uploads''')


def create_subresource(context, resource_dict):

    package_data = {
        'id': resource_dict['package_id'],
    }
    
    resources_list = tk.get_action("package_show")(context, package_data)['resources']
    
    names_list = []
    
    for i in resources_list:
        names_list.append(i['name'])

    if 'test.jpg' not in names_list:
    
        data_dict = {
            'package_id': resource_dict['package_id'],
            'name': 'test.jpg',
            'url': 'test.jpg',
            'url_type': 'upload',
        }

        x = tk.get_action("resource_create")(context, data_dict)
        upload_path = storage_path + '/resources/' + x['id'][0:3] + "/" + x['id'][3:6]
        upload_filename = x['id'][6:]
        filepath = Path(os.path.join(upload_path, upload_filename))
        filepath.parent.mkdir(parents=True, exist_ok=True)
        copyfile('/home/blagoja/Downloads/demo/test.jpeg', filepath)
        return

    else:
        print("======================================================================")
        print('subresource not created')
        print("======================================================================")
        return

