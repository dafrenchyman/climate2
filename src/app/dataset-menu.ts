import {Component, Inject, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogRef} from '@angular/material';

declare var d3: any;

/**
 * Created by dafre on 6/1/2017.
 */


@Component({
  templateUrl: './dataset-menu.html'
})
export class DatasetMenu {

  private list;

  OpenDatasetDialog(menu_location) {
    const curr_menu = menu_location;


    const dialogRef = this.dialog.open(DatasetMenu, {data: menu_location});
    let selected_dataset: string;
    dialogRef.afterClosed().subscribe(result => {
      selected_dataset = result;
      if (result !== undefined) {
        this.dialogRef.close(result);
      }
      return result;
    });
    return selected_dataset;

  }

  SelectDataset(dataset) {

    // const dialogRef = this.dialog.open(DatasetMenu, {data: dataset});
    this.dialogRef.close(dataset);
    // this.dialog.closeAll();
    return dataset.fullPath;
  }

  private _MenuDataFull: {
    Name: string,
    FullName: string,
    Dataset_ID: number,
    DatabaseStore: string,
    OriginalLocation: string,
    StartDate: string,
    EndDate: string,
    Units: string,
    DefaultLevel: string
  }[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialog: MatDialog, public dialogRef: MatDialogRef<DatasetMenu>) {
    this._MenuDataFull = data;
    this.list = data;
    this.dialogRef = dialogRef;
  }
}
