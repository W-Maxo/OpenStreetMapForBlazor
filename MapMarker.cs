using Microsoft.AspNetCore.Components;

namespace OpenStreetMapForBlazor;

public class MapMarker
{
    [Parameter]
    public MapPosition Position { get; set; } = new MapPosition() { Lat = 0, Lng = 0 };

    [Parameter]
    public string Title { get; set; }

    [Parameter]
    public string Label { get; set; }

    //OpenStreetMaps _map;

    //[CascadingParameter]
    //public OpenStreetMaps Map
    //{
    //    get
    //    {
    //        return _map;
    //    }
    //    set
    //    {
    //        if (_map != value)
    //        {
    //            _map = value;
    //            _map.AddMarker(this);
    //        }
    //    }
    //}

    public void Dispose()
    {
        //Map?.RemoveMarker(this);
    }
}
