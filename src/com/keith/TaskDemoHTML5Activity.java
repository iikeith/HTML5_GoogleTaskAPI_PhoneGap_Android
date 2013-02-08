package com.keith;

import java.io.File;

import android.app.Activity;
import android.os.Bundle;

import org.json.JSONArray;
import org.json.JSONObject;

import android.accounts.Account;
import android.accounts.AccountManager;
import android.accounts.AccountManagerCallback;
import android.accounts.AccountManagerFuture;
import android.accounts.OperationCanceledException;
import android.app.AlertDialog;
import android.app.Dialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.res.Configuration;
import android.content.res.Resources;
import android.graphics.Bitmap;
import android.os.Bundle;
import android.os.Environment;
import android.os.Message;
import android.util.Log;
import android.view.inputmethod.InputMethodManager;
import android.webkit.HttpAuthHandler;
import android.webkit.WebSettings;
import android.webkit.WebView;

import com.keith.*;
import com.phonegap.DroidGap;
import com.phonegap.DroidGap.GapViewClient;
import com.keith.TaskDemoHTML5Activity;

public class TaskDemoHTML5Activity extends DroidGap {
	/** Called when the activity is first created. */
	public static final int DIALOG_ACCOUNTS = 0x1234;
	public static final int DIALOG_NO_ACCOUNT = 0x1235;
	public static final int DIALOG_WELCOME = 0x1236;
	public static final int DIALOG_NO_CONNECTION = 0x1237;
	
	public static final int REQUEST_AUTHENTICATE = 0;
	
	public static final int NumOfItemsOfTask = 6; 
    //public static final String AUTH_TOKEN_TYPE = "oauth2:https://www.googleapis.com/auth/tasks";
    public static final String AUTH_TOKEN_TYPE = "Manage your tasks";
	AccountManager accountManager;
	TaskDemoHTML5Activity mActivity;
	int selectedAccount = -1;
	String accountName = null;
	String oauth2_token = null;


    public class GList{  	
    	
    	public GList(String[] list, int numOfTasks, String[] tasks){
    		mList = new String[list.length];
    		mTasks = new String[tasks.length];
    		System.arraycopy(list, 0 , mList, 0, list.length);
    		System.arraycopy(tasks, 0 , mTasks, 0, tasks.length);
    		mNumOfTasks = numOfTasks;	
    	}
    	public String[] mList;
    	public int mNumOfTasks;
    	public String[] mTasks;
    	
    }
    
    public GList[] gList = new GList[10];
    public int numOfGList = -1;
	
    @Override
    public void onCreate(Bundle savedInstanceState) { 	        
    	super.onCreate(savedInstanceState);        
                      
        // Set properties for activity
        //super.setStringProperty("loadingDialog", "Google Task, Login ... "); // show loading dialog
        //super.setStringProperty("errorUrl", "file:///android_asset/www/index.html#access_token="+token+"&token_type=Bearer&expires_in=3600"); // if error loading file in super.loadUrl().
        //super.setBooleanProperty("loadInWebView", true); 
        
        // Initialize activity
        super.init();    
       
        // Enable javascript console.log
        super.appView.getSettings().setNavDump(true);
        
        WebSettings websetting = super.appView.getSettings();
        websetting.setAllowFileAccess(true);
        Log.d("Keith", "onCreate: websetting.getAllowFileAccess="+websetting.getAllowFileAccess());      
        
        Log.d("Keith", "onCreate: appView="+super.appView);
        //Set my viewclient for intercepting the "http://localhost#access_token=xxx" 
        MyViewClient myviewclient = new MyViewClient(this);
        Log.d("Keith", "myviewclient="+myviewclient);
        super.appView.setWebViewClient( myviewclient ); 
        
        super.appView.addJavascriptInterface(this,"hellogap");
        
        // Add your plugins here or in JavaScript
        //super.addService("MyService", "com.phonegap.examples.MyService");
        
        // Clear cache if you want
        //super.appView.clearCache(true);
        
        // Load your application
        //super.setIntegerProperty("splashscreen", R.drawable.s2); // load splash.jpg image from the resource drawable directory
                
        setContentView(R.layout.splash);        
    }
    
    public void hello(){
    	Log.d("Keith", "hello");
    	showDialog(DIALOG_WELCOME);
    }
    
    public void showNoConnection(){
    	Log.d("Keith", "showNoConnection");
    	showDialog(DIALOG_NO_CONNECTION);
    }
    
    public void showKeyBoard() {
        InputMethodManager mgr = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        // only will trigger it if no physical keyboard is open
        mgr.showSoftInput(super.appView, InputMethodManager.SHOW_IMPLICIT);
    }
    
    public void hideKeyBoard() {
        InputMethodManager mgr = (InputMethodManager) getSystemService(Context.INPUT_METHOD_SERVICE);
        mgr.hideSoftInputFromWindow(super.appView.getWindowToken(), 0);
    }
    
    public String getAppName(){
    	Resources res = getResources();
    	return res.getString(R.string.app_name);   	
    }
    
    public boolean requestToken(){
    	Log.d("Keith", "requestToken: selectedAccount="+selectedAccount);
    	Log.d("Keith", "Thread = " + Thread.currentThread());
    	if( selectedAccount == -1 ){
    		return false;
    	}

        Account[] accounts = accountManager.getAccountsByType("com.google");   
    	
        final Account account = accounts[selectedAccount];
        
		if(oauth2_token != null){
			Log.d("Keith", "requestToken: invalidateAuthToken token="+oauth2_token);
			accountManager.invalidateAuthToken("com.google", oauth2_token);
		}
        
    	accountManager.getAuthToken(account, AUTH_TOKEN_TYPE, null, this, 
	    	new AccountManagerCallback<Bundle>() {
				public void run(AccountManagerFuture<Bundle> future) {
					try {
						Bundle bundle = future.getResult();
						if (bundle.containsKey(AccountManager.KEY_INTENT)) {
							Log.d("Keith", "requestToken: KEY_INTENT");
							Intent intent = bundle.getParcelable(AccountManager.KEY_INTENT);
			                intent.setFlags(intent.getFlags() & ~Intent.FLAG_ACTIVITY_NEW_TASK);
			                startActivityForResult(intent, REQUEST_AUTHENTICATE);						
						} else if (bundle.containsKey(AccountManager.KEY_AUTHTOKEN)) {
							String token = future.getResult().getString(AccountManager.KEY_AUTHTOKEN);
							Log.d("Keith", "requestToken: token="+token);
							oauth2_token = token;
							sendtokenToJavaScript();
						}
					} catch (OperationCanceledException e) {						
						Log.d("Keith", "requestToken: OperationCanceledException="+e);
						sendtokenToJavaScript();
					} catch (Exception e) {
						Log.d("Keith", "requestToken: Exception="+e);
						sendtokenToJavaScript();
					}
				}
	      	},
	      	null
	    );    	

    	return true;
    }
    
    private void sendtokenToJavaScript(){
    	Log.d("Keith", "sendtokenToJavaScript ...");
    	super.appView.loadUrl("javascript:onReceiveToken()");
    	Log.d("Keith", "sendtokenToJavaScript ...done");    	
    }
    
    public String getToken(){
    	Log.d("Keith", "getToken ... token="+oauth2_token);
    	return oauth2_token;
    }
    
    public String getAccountName(){
    	Log.d("Keith", "getAccountName ... ="+accountName);
    	return accountName;
    }

    
	@Override
    protected void onStart() {
        super.onStart();        
        // The activity is about to become visible.
        
        if(oauth2_token != null){
        	return;    	
        }
        
        mActivity = this;
        oauth2_token = null;
        accountManager = AccountManager.get(this);
		int selected = this.selectedAccount;
        Account[] accounts = accountManager.getAccountsByType("com.google");       
        Log.d("Keith", "onStart: accounts length="+accounts.length);
        for(int i=0;i<accounts.length;i++){
        	Log.d("Keith", "onStart: accounts["+i+"]="+accounts[i]);
        }
        if(accounts.length==1){
        	selectedAccount = 0;
        	accountName = accounts[0].toString();
        	getAccountTokenThenLaunchWebApp(accounts[0]);
        } else if(accounts.length>1) {
        	if(selected == -1){
        		Log.d("Keith", "onStart: showDialog ...");
        		showDialog(DIALOG_ACCOUNTS);
        		Log.d("Keith", "onStart: showDialog ... end");
        	} else {
        		selected = this.selectedAccount;
        		accountName = accounts[selected].toString();
        		this.selectedAccount = -1;
        	}
	    } else {
	    	showDialog(DIALOG_NO_ACCOUNT);
	    }       	
    }
	
	@Override
	protected void onActivityResult(int requestCode, int resultCode, Intent data) {
		super.onActivityResult(requestCode, resultCode, data);
		switch (requestCode) {
			case REQUEST_AUTHENTICATE:
				if (resultCode == RESULT_OK) {
					Log.d("Keith", "onActivityResult: resultCode = RESULT_OK");
					//gotAccount(false);
				} else {
					Log.d("Keith", "onActivityResult: resultCode = "+resultCode);
					//showDialog(DIALOG_ACCOUNTS);
				}
				break;
		}
	}
    
    private void getAccountTokenThenLaunchWebApp(Account account){
	    accountManager.getAuthToken(account, AUTH_TOKEN_TYPE, null, this, 
	    	new AccountManagerCallback<Bundle>() {
				public void run(AccountManagerFuture<Bundle> future) {
					try {
						Bundle bundle = future.getResult();
						if (bundle.containsKey(AccountManager.KEY_INTENT)) {
							Log.d("Keith", "AccountManagerCallback: KEY_INTENT");
							Intent intent = bundle.getParcelable(AccountManager.KEY_INTENT);
			                intent.setFlags(intent.getFlags() & ~Intent.FLAG_ACTIVITY_NEW_TASK);
			                startActivityForResult(intent, REQUEST_AUTHENTICATE);						
						} else if (bundle.containsKey(AccountManager.KEY_AUTHTOKEN)) {
			   		        // If the user has authorized your application to use the tasks API
							// a token is available.
							String token = future.getResult().getString(AccountManager.KEY_AUTHTOKEN);
							Log.d("Keith", "AccountManagerCallback: token="+token);
							oauth2_token = token;
							// Now you can use the Tasks API...
							mActivity.setContentView(mActivity.root);
							File sdcard = Environment.getExternalStorageDirectory();
							Log.d("Keith", "getAccountTokenThenLaunchWebApp ... sdcard.getAbsolutePath()="+ sdcard.getAbsolutePath());
							File versionfile = new File( sdcard.getAbsolutePath() + "/" +getAppName() +"/index.html");
							if(versionfile.exists()) {
								Log.d("Keith", "=====>    getAccountTokenThenLaunchWebApp ... loading sdcard version");
								mActivity.loadUrl("file://"+sdcard.getAbsolutePath()+ "/" +getAppName() +"/index.html#access_token="+token);
							} else {								
								Log.d("Keith", "=====>    getAccountTokenThenLaunchWebApp ... loading assets version");
								mActivity.loadUrl("file:///android_asset/www/index.html#access_token="+token);
							}
						}
					} catch (OperationCanceledException e) {
						// TODO: The user has denied you access to the API, you should handle that
						Log.d("Keith", "AccountManagerCallback: OperationCanceledException="+e);
						//showDialog(DIALOG_ACCOUNTS);
					} catch (Exception e) {
					    //handleException(e);
						Log.d("Keith", "AccountManagerCallback: Exception="+e);
						//showDialog(DIALOG_NO_CONNECTION);
						mActivity.setContentView(mActivity.root);
						
						File sdcard = Environment.getExternalStorageDirectory();
						Log.d("Keith", "getAccountTokenThenLaunchWebApp ... sdcard.getAbsolutePath()="+ sdcard.getAbsolutePath());
						File versionfile = new File( sdcard.getAbsolutePath() + "/" +getAppName() + "/index.html");						
						if(versionfile.exists()) {
							Log.d("Keith", "=====>    getAccountTokenThenLaunchWebApp ... loading sdcard version");
							mActivity.loadUrl("file://"+sdcard.getAbsolutePath() + "/" +getAppName() +"/index.html#access_token="+oauth2_token);
						} else {								
							Log.d("Keith", "=====>    getAccountTokenThenLaunchWebApp ... loading assets version");
							mActivity.loadUrl("file:///android_asset/www/index.html#access_token="+oauth2_token);
						}
					
					}
				}
	      	},
	      	null
	    );
    }
    
    
	@Override
	protected Dialog onCreateDialog(int id) {
		AlertDialog.Builder builder = new AlertDialog.Builder(this);
		switch (id) {
			case DIALOG_ACCOUNTS:			
				builder.setTitle("Select a Google account");
				final Account[] accounts = accountManager.getAccountsByType("com.google");
				final int size = accounts.length;
				String[] names = new String[size];
				for (int i = 0; i < size; i++) {
					names[i] = accounts[i].name;
				}
				builder.setItems(names, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						// Stuff to do when the account is selected by the user
						//gotAccount(accounts[which]);
					    Log.d("Keith", "onClick: select account="+accounts[which]);
					    mActivity.selectedAccount = which;
					    mActivity.accountName = accounts[which].toString();
					    getAccountTokenThenLaunchWebApp(accounts[which]);
					}
				});
				return builder.create();
				
			case DIALOG_NO_ACCOUNT:
				String[] itemnames = new String[1];
				itemnames[0] = "Exit"; 
				builder.setTitle("No Google account");			
				builder.setItems(itemnames, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						// Stuff to do when the account is selected by the user
						//gotAccount(accounts[which]);
					    Log.d("Keith", "onClick: no account");
					}
				});
				return builder.create();
			case DIALOG_WELCOME:
				String[] items = new String[1];
				items[0] = "Demo"; 
				builder.setTitle("Welcome to HTML5+PhoneGap+Sencha");		
				builder.setItems(items, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						// Stuff to do when the account is selected by the user
						//gotAccount(accounts[which]);
					    Log.d("Keith", "onClick: DIALOG_WELCOME");
					}
				});
				return builder.create();	
			case DIALOG_NO_CONNECTION:
				String[] noconnections = new String[1];
				noconnections[0] = "No Connection";
				builder.setTitle("No Connection");		
				builder.setItems(noconnections, new DialogInterface.OnClickListener() {
					public void onClick(DialogInterface dialog, int which) {
						// Stuff to do when the account is selected by the user
						//gotAccount(accounts[which]);
					    Log.d("Keith", "onClick: DIALOG_NoConnection");
					}
				});
				return builder.create();					
				
		}
		return null;
	}
	
	
	@Override
	public void onConfigurationChanged(Configuration newConfig) {
	    super.onConfigurationChanged(newConfig);
	    Log.d("Keith", "onConfigurationChanged");
	}
    
    
    public class MyViewClient extends GapViewClient {
    	TaskDemoHTML5Activity ctx;
    	
    	public MyViewClient(TaskDemoHTML5Activity ctx) {
    		super(ctx);
    		this.ctx = ctx;
        }
    	
    	@Override
        public boolean shouldOverrideUrlLoading(WebView view, String url) {
    		Log.d("Keith", "shouldOverrideUrlLoading: url="+url);    		
    		return super.shouldOverrideUrlLoading(view, url);
    	}
    	
    	@Override
    	public void onPageStarted (WebView view, String url, Bitmap favicon){
    		Log.d("Keith", "onPageStarted: url="+url);
    		Log.d("Keith", "onPageStarted: view="+view);    			
   			super.onPageStarted(view, url,favicon);
    	}
    	
    	@Override
    	public void onPageFinished (WebView view, String url){
    		Log.d("Keith", "onPageFinished: url="+url);  		
    		super.onPageFinished(view, url);       
    	}
    	

    	
    	@Override
    	public void onLoadResource(WebView view, String url)
    	{
			Log.d("Keith", "onLoadResource: url="+url);
	        super.onLoadResource(view, url);          
    	}
    	
    	@Override
    	public void onReceivedHttpAuthRequest(WebView view, HttpAuthHandler handler, String host, String realm){
    		Log.d("Keith", "onReceivedHttpAuthRequest: host="+host+
    				       "realm" + realm    				
    	    );
	        super.onReceivedHttpAuthRequest(view, handler, host, realm);
    	}
    	
    	@Override
    	public void onTooManyRedirects(WebView view, Message cancelMsg, Message continueMsg) {
    		Log.d("Keith", "onTooManyRedirects: cancelMsg="+cancelMsg+
				       "continueMsg" + continueMsg    				
    				);
    		super.onTooManyRedirects(view, cancelMsg, continueMsg);
    		
    	}
    	
    }
}