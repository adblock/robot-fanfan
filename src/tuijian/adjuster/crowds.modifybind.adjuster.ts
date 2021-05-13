export class CrowdsModifyBindAdjusterClass {
    public data:{
        crowds: {
            price:number,
            status:string,
            crowd_id:number,
        }[];
        adgroup_id: number;
    } | undefined;
    public api = 'taobao.feedflow.item.crowd.modifybind';

    // constructor(data:any){}

    public add(params:{price:number, status:string, crowd_id:number, adgroup_id:number}):void {
        if(this.data === undefined){
            this.data = {
                crowds:[
                    {
                        price: params.price,
                        status: params.status,
                        crowd_id: params.crowd_id,
                    }
                ],
                adgroup_id: params.adgroup_id,
            }
        }else{
            this.data.crowds.push({
                price:0,
                status:'start',
                crowd_id:0,
            });
        }
    }
}