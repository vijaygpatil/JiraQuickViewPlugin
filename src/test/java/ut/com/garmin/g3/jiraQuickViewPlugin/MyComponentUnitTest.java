package ut.com.garmin.g3.jiraQuickViewPlugin;

import org.junit.Test;
import com.garmin.g3.jiraQuickViewPlugin.MyPluginComponent;
import com.garmin.g3.jiraQuickViewPlugin.MyPluginComponentImpl;

import static org.junit.Assert.assertEquals;

public class MyComponentUnitTest
{
    @Test
    public void testMyName()
    {
        MyPluginComponent component = new MyPluginComponentImpl(null);
        assertEquals("names do not match!", "myComponent",component.getName());
    }
}