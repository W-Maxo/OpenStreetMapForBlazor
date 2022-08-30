using Microsoft.AspNetCore.Components;
using Microsoft.AspNetCore.Components.Rendering;
using Microsoft.JSInterop;
using Microsoft.AspNetCore.Components.CompilerServices;

namespace OpenStreetMapForBlazor;

public class OpenStreetMap : ComponentBase, IDisposable
{
    [Parameter]
    public virtual bool Visible { get; set; } = true;

    [Parameter(CaptureUnmatchedValues = true)]
    public IReadOnlyDictionary<string, object> Attributes { get; set; }

    private List<MapMarker> markers = new List<MapMarker>();

    [Parameter]
    public virtual string Style { get; set; }

    private ElementReference wrapper;

    protected override void BuildRenderTree(RenderTreeBuilder builder)
    {
        if (!this.Visible) return;

        builder.AddContent(8, " ");
        builder.OpenElement(9, "div");
        builder.AddAttribute(10, "style", "height: 100%;" + this.Style);
        builder.AddMultipleAttributes(11, RuntimeHelpers.TypeCheck((IEnumerable<KeyValuePair<string, object>>)Attributes));
        builder.AddAttribute(12, "class", this.GetCssClass());
        builder.AddElementReferenceCapture(13, (Action<ElementReference>)(__value => this.wrapper = __value));
        builder.AddMarkupContent(14, "\r\n <div class=\"ui-map-container-os\" style=\"position: relative; overflow: hidden;\"></div>\r\n    ");
        builder.CloseElement();
        builder.AddMarkupContent(15, "\r\n");
    }

    [Parameter]
    public EventCallback<MapClickEventArgs> MapClick { get; set; }

    [Parameter]
    public EventCallback<MapMarker> MarkerClick { get; set; }

    [Parameter]
    public string? ApiKey { get; set; }

    [Parameter]
    public double Zoom { get; set; } = 8.0;

    [Parameter]
    public MapPosition Center { get; set; } = new MapPosition()
    {
        Lat = 0.0,
        Lng = 0.0
    };

    protected override void OnInitialized()
    {
        UniqueID = Convert.ToBase64String(Guid.NewGuid().ToByteArray()).Replace("/", "-").Replace("+", "-").Substring(0, 10);
    }

    public string UniqueID { get; set; }

    protected string GetId()
    {
        if (Attributes != null && Attributes.TryGetValue("id", out var id) && !string.IsNullOrEmpty(Convert.ToString(@id)))
        {
            return $"{@id}";
        }

        return UniqueID;
    }

    protected string GetCssClass()
    {
        if (Attributes != null && Attributes.TryGetValue("class", out var @class) && !string.IsNullOrEmpty(Convert.ToString(@class)))
        {
            return $"{GetComponentCssClass()} {@class}";
        }

        return GetComponentCssClass();
    }

    public void AddMarker(MapMarker marker)
    {
        //if (this.markers.IndexOf(marker) != -1)
        //    return;
        //this.markers.Add(marker);
    }

    public void RemoveMarker(MapMarker marker)
    {
        //if (this.markers.IndexOf(marker) == -1)
        //    return;
        //this.markers.Remove(marker);
    }

    protected string GetComponentCssClass()
    {
        return "os-map";
    }

    [JSInvokable("OSMap.OnMapClick")]
    public async Task OnMapClick(MapClickEventArgs args)
    {
        await this.MapClick.InvokeAsync(args);
    }

    [JSInvokable("OSMap.OnMarkerClick")]
    public async Task OnMarkerClick(MapMarker marker)
    {
        await MarkerClick.InvokeAsync(marker);
    }

    protected override async Task OnAfterRenderAsync(bool firstRender)
    {
        OpenStreetMap openStreetMap = this;
        if (firstRender) //(object)openStreetMap.wrapper
            await openStreetMap.JSRuntime.InvokeVoidAsync("OSMap.createMap", (object)openStreetMap.wrapper, (object)DotNetObjectReference.Create<OpenStreetMap>(openStreetMap), (object)openStreetMap.UniqueID, (object)openStreetMap.ApiKey, (object)openStreetMap.Zoom, (object)openStreetMap.Center, (object)openStreetMap.markers.Select(m => new
            {
                Title = m.Title,
                Label = m.Label,
                Position = m.Position
            }));
        else
            await openStreetMap.JSRuntime.InvokeVoidAsync("OSMap.updateMap", (object)openStreetMap.UniqueID, (object)openStreetMap.Zoom, (object)openStreetMap.Center, (object)openStreetMap.markers.Select(m => new
            {
                Title = m.Title,
                Label = m.Label,
                Position = m.Position
            }));
    }

    public void Dispose()
    {
        _ = JSRuntime.InvokeVoidAsync("OSMap.destroyMap", UniqueID);
    }

    [Inject]
    private IJSRuntime JSRuntime { get; set; }
}

internal static class TypeInference
{
    public static void CreateCascadingValue_0<TValue>(
        RenderTreeBuilder builder,
        int seq,
        int seq0,
        TValue arg0,
        int seq1,
        RenderFragment arg1)
    {
        builder.OpenComponent<CascadingValue<TValue>>(seq);
        builder.AddAttribute(seq0, "Value", arg0);
        builder.AddAttribute(seq1, "ChildContent", arg1);
        builder.CloseComponent();
    }
}
