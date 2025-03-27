<?php

  $uid = utf8_encode(json_encode(json_decode($_POST['db']), JSON_PRETTY_PRINT));

  $file = 'db/db.json';

  $current = file_get_contents($file);

  $current = $uid;

  file_put_contents($file, $current);

  echo  '{"sucesso" : true }';
