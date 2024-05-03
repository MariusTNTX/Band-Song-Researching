import { Injectable } from '@angular/core';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { ResourceList, SongList, AlbumList } from '../model/example-data';
import { INPUT_TYPE } from '../model/input-type';

@Injectable({
  providedIn: 'root'
})
export class FormService {

  public resourceForm!: FormGroup;
  public mainDataForm!: FormGroup;
  public albumForm!: FormGroup;
  public songControl!: FormControl;
  
  constructor(private formBuilder: FormBuilder) { 
    this.resourceForm = this.setResourceForm();
    this.mainDataForm = this.setMainDataForm();
    this.albumForm = this.setAlbumForm();
    this.songControl = new FormControl(JSON.parse(JSON.stringify(SongList)));
    this.mainDataForm.valueChanges.subscribe(console.log);
    this.resourceForm.valueChanges.subscribe(console.log);
    this.albumForm.valueChanges.subscribe(console.log);
    this.songControl.valueChanges.subscribe(console.log);
  }

  setResourceForm(): FormGroup {
    let totalResources: { [key: string]: FormControl } = ResourceList.reduce((result: any, item: any) => {
      result[item.id] = new FormGroup({ 
        id: new FormControl(item.id),
        rawContent: new FormControl(''), 
        checked: new FormControl(item.value),
        inputType: new FormControl(item.inputType),
        songList: new FormControl(JSON.parse(JSON.stringify(item.songList.filter((songId: any, index: number, list: any) => list.findIndex((id: any) => id === songId) === index)))),
      });
      result.filtered = new FormControl(false);
      return result;
    }, {});
    return this.formBuilder.group(totalResources);
  }

  setMainDataForm(): FormGroup {
    return this.formBuilder.group({
      bandName: new FormControl(''),
      bandCountry: new FormControl(''),
      itemsByResource: new FormControl(10),
      ampliation: new FormControl(false),
    });
  }

  setAlbumForm(): FormGroup {
    return this.formBuilder.group({
      rawContent: new FormControl(''),
      inputType: new FormControl(INPUT_TYPE.TEXT),
      albumList: new FormControl(JSON.parse(JSON.stringify(AlbumList))),
      filtered: new FormControl(false),
    });
  }
}
