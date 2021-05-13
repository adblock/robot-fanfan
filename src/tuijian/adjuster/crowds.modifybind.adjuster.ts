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

    public add(data:{price:number, status:string, crowd_id:number}):void {
        this.data = {
            crowds:[
                {
                    price:0,
                    status:'start',
                    crowd_id:0,
                },
                {
                    price:0,
                    status:'start',
                    crowd_id:0,
                },
                {
                    price:0,
                    status:'start',
                    crowd_id:0,
                },
                {
                    price:0,
                    status:'start',
                    crowd_id:0,
                }
            ],
            adgroup_id:1111,
        }
    }
}