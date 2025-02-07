import ckan.plugins.toolkit as tk
from ckan.common import config
import os
import logging
from pathlib import Path
from shutil import copyfile
import openpyxl
import shutil
import tempfile

log = logging.getLogger(__name__)

try:
    storage_path = config.get('ckan.storage_path')
except:
    log.critical('''Please specify a ckan.storage_path in your config
                         for your uploads''')


def extract_map(filename):
    # filename = '/home/blagoja/Downloads/test_map.xlsx'
    wb = openpyxl.load_workbook(filename)
    ws = wb['Sheet1']

    for idx, row in enumerate(ws.iter_rows()):
        geojson_text = row[1].value

    f = tempfile.NamedTemporaryFile(mode='w+t', delete=False)
    f.write(geojson_text)
    file_name = f.name
    f.close()
    shutil.copy(file_name, 'bar.geojson')
    os.remove(file_name)

    return


def create_subresource(context, resource_dict):

    package_data = {
        'id': resource_dict['package_id'],
    }
    
    resources_list = tk.get_action("package_show")(context, package_data)['resources']
    
    subresource_name = resource_dict['name'].rsplit('.', 1)[0] + '.geojson'
    names_list = []

    for i in resources_list:
        names_list.append(i['name'])

    if subresource_name not in names_list:
    
        data_dict = {
            'package_id': resource_dict['package_id'],
            'name': subresource_name,
            'url': subresource_name,
            'url_type': 'upload',
        }
        x = tk.get_action("resource_create")(context, data_dict)
        upload_path = storage_path + '/resources/' + x['id'][0:3] + "/" + x['id'][3:6]
        upload_filename = x['id'][6:]
        filepath = Path(os.path.join(upload_path, upload_filename))
        filepath.parent.mkdir(parents=True, exist_ok=True)
        copyfile('/home/blagoja/Downloads/demo/test.geojson', filepath)
        
        return

    else:
        print("======================================================================")
        print('subresource not created')
        print("======================================================================")
        return

